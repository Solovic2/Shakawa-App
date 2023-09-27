const express = require("express");
const router = express.Router();
const fs = require("fs");
const { requireAuth } = require("../middleware");
const wss = require("../websocket");
const chokidar = require("chokidar");
const prisma = require("../prisma/prismaClient");
const { Role, Status } = require("@prisma/client");
const path = require('path')
const folderPath = [process.env.FOLDER_VOICE_PATH, process.env.FOLDER_IMAGES_PATH];
// WebSocket for notification

wss.on("connection", (ws) => {
  console.log("WebSocket connected");
});
wss.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log("Port in Use");
  }
});
// Watching Files
const watcher = chokidar.watch([folderPath] , {
  persistent: true,
  ignoreInitial: true,
  usePolling: true,
});
watcher
  .on("add", async (path) => {
    console.log(`File ${path} has been added`);
    if(!path.includes("tmp1")){
      const data = splitPath(path);
      let item = {
        type: "add",
        data: {
          path: path,
          info: "",
          mobile: data[0],
          fileDate: data[1],
          fileType: data[2],
          repliedBy: null,
          groupId: null,
          status: Status.ON_UNSEEN,
        },
      };
      const message = JSON.stringify(item);
      wss.clients.forEach((client) => {
        client.send(message);
      });
    }
  
  })
  .on("unlink", async (path) => {
    console.log(`File ${path} has been removed`);
    let deleteData = null;
    try {
      deleteData = await prisma.file.delete({
        where: {
          path: path,
        },
      });
    } catch (error) {}

    if(!path.includes("tmp1")){
      let message = {
        type: "delete",
        data: {
          path: path,
          groupId: deleteData ? deleteData.groupId : null,
        },
      };
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(message));
      });
    }
   
  })
  .on("error", (error) => console.log(`Watcher error: ${error}`));

// Split The Path
// element will be phoneNumber-day-month-year.[txt/wav]
// info => [phoneNumber or '', day-month-year, txt or wav]
const splitPath = (element) => {
  const path = element.split(/[\\\.]/);
  const splitter = path[path.length - 2].split("-");
  const info = [];
  if (splitter[0].length >= 11) {
    info.push(splitter[0]);
    info.push(splitter[1] + "-" + splitter[2] + "-" + splitter[3]);
  } else {
    info.push("");
    info.push(splitter[1] + "-" + splitter[2] + "-" + splitter[3]);
  }
  info.push(path[path.length - 1]);
  return info;
};

// Get Files With Last Modified
function getSortedFilesByLastModifiedTime(directoryPaths) {
  const voices = fs.readdirSync(directoryPaths[0]);
  const images = fs.readdirSync(directoryPaths[1]);
  const files = voices.concat(images)

  // // Create an array to store file information
  const fileDetails = [];

  // // Iterate through the files
  files.forEach((file) => {
    // Get the file path
    const filePath = `${file.includes("wav") || file.includes("txt") ? directoryPaths[0] : directoryPaths[1] }\\${file}`;

    // Get the file stats
    const stats = fs.statSync(filePath);

    // Store file details
    fileDetails.push({
      path: filePath,
      name: file,
      lastModified: stats.mtime,
    });
  });

  // Sort files by last modified date in descending order
  fileDetails.sort((a, b) => b.lastModified - a.lastModified);
  return fileDetails;
}
// Read And Put Into Database
async function readAllFiles(folderPath) {
  try {
    let allFiles = [];
    let paths = [];
    const sortedFiles = await getSortedFilesByLastModifiedTime(folderPath);
    for (let i = 0; i < sortedFiles.length; i++) {
      paths.push(sortedFiles[i].path);
    }
    if (paths.length > 0) {
      const disabledFiles = await prisma.file.findMany({
        where: {
          path: {
            in: paths,
          },
        },
        include:{
          user: true
        }
      });
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const data = splitPath(path);

        // Check if path exists in disabledFiles
        const element = disabledFiles.find((df) => df.path === path);
        if (element !== undefined && element.flag !== 1) {
          const fileData = {
            path: path,
            info: element.info,
            mobile: data[0],
            fileDate: data[1],
            fileType: data[2],
            repliedBy: element.user
              ? element.user.username
              : null,
            groupId: element.groupId,
            status: element.status,
          };
          allFiles.push(fileData);
        } else if (element === undefined) {
          const fileData = {
            path: path,
            info: "",
            mobile: data[0],
            fileDate: data[1],
            fileType: data[2],
            repliedBy: null,
            groupId: null,
            status: Status.ON_UNSEEN,
          };
          allFiles.push(fileData);
        }
      }
    }
    // console.log(allFiles);
    return allFiles;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
// Get Today Shakawa
function getDataToday(files, date) {
  try {
    let jsonData = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].fileDate === date) {
        jsonData.push(files[i]);
      }
    }
    return jsonData;
  } catch (err) {
    console.error(err);
  }
}

async function getSpecifiedFiles(user) {
  const files = await prisma.file.findMany({
    where: {
      flag: 0,
      group: {
        id: +user.groupId,
      },
    },
    include: {
      user: true,
    },
  });
  let allFiles = [];
  for (let i = 0; i < files.length; i++) {
    const path = files[i].path;
    const data = splitPath(path);
    const fileData = {
      path: path,
      info: files[i].info,
      mobile: data[0],
      fileDate: data[1],
      fileType: data[2],
      repliedBy: files[i].user ? files[i].user.username : null,
      groupId: files[i].groupId,
      status: files[i].status,
    };
    allFiles.push(fileData);
  }
  return allFiles;
}

function getContentType(fileName) {
  const fileExt = path.extname(fileName).toLowerCase();
  switch (fileExt) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    // Add more cases for other image formats as needed
    default:
      return 'application/octet-stream';
  }
}
// create a route to get data from the database
router.get("/", requireAuth, async (req, res) => {
  const { user } = req;
  if (user.role === Role.User) {
    const files = await getSpecifiedFiles(user);
    res.json(files);
  } else {
    fs.access(folderPath[0], fs.constants.F_OK, async (err) => {
      if (err) {
        res.status(400).json("تأكد من اتصالك بفولدر الصوتيات من عند الخادم");
        return;
      } else {
        const files = await readAllFiles(folderPath);
        res.json(files);
      }
    });
  }
});

// API To Get Groups
router.get("/groups", async (req, res) => {
  const data = await prisma.group.findMany();
  res.json(data);
});

// create a route to get data today
router.get("/dateToday/:date", requireAuth, async (req, res) => {
  try {
    const date = req.params.date;
    const { user } = req;
    let files = [];
    if (user.role === Role.User) {
      files = await getSpecifiedFiles(user);
    } else {
      files = await readAllFiles(folderPath);
    }
    const data = getDataToday(files, date);
    res.json(data);
  } catch (error) {
    console.error("Error updating database:", error);
    res.sendStatus(500);
  }
});

// API For Get The File Image
router.get("/file/:filePath", requireAuth, (req, res) => {
  const filePath = folderPath[1] + "\\" + req.params.filePath;
  console.log(filePath);
  // Check if the file exists
  if (fs.existsSync(filePath)) {
     // Read the image file and convert it to a Base64 encoded string
     const fileData = fs.readFileSync(filePath, { encoding: 'base64' });

     // Determine the content type based on the file extension
     const contentType = getContentType(req.params.filePath);
 
     // Send the Base64 encoded image data to the frontend
     res.json({ contentType, data: fileData });
  
  } else {
    res.status(404).send('File not found');
  }
});

router.get("/audio/:filePath", requireAuth, (req, res) => {
  const filePath = folderPath[0] + "\\" + req.params.filePath;
  fs.stat(filePath, (err, stat) => {
    if (err) {
      res.status(404).send("File not found");
    } else {
      const fileSize = stat.size;

      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": "audio/*",
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          "Content-Length": fileSize,
          "Content-Type": "audio/*",
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
      }
    }
  });
});

/* API for Manager To Attach File To Group */
router.post("/attach-file-to-group", requireAuth, async (req, res) => {
  try {
    const data = req.body;
    const existingFile = await prisma.file.findUnique({
      where: {
        path: data.path,
      },
    });

    let updateData = {};
    const isSameGroupID = existingFile && existingFile.groupId !== +data.group;
    if (!isSameGroupID) {
      updateData = {
        groupId: +data.group,
        info: "",
        userId: null,
        status: Status.ON_UNSEEN,
      };
    } else {
      updateData = {
        groupId: +data.group,
      };
    }

    const updateOrAddFile = await prisma.file.upsert({
      where: {
        path: data.path,
      },
      update: updateData,
      create: {
        path: data.path,
        groupId: +data.group,
        info: "",
        userId: null,
      },
    });
    const splitData = splitPath(data.path);
    updateOrAddFile.mobile = splitData[0];
    updateOrAddFile.fileDate = splitData[1];
    updateOrAddFile.fileType = splitData[2];
    updateOrAddFile.repliedBy = null;

    let item = {
      type: isSameGroupID ? "user_delete_add" : "user_add",
      data: updateOrAddFile,
      prevGroupID: existingFile ? existingFile.groupId : null,
    };
    const message = JSON.stringify(item);
    wss.clients.forEach((client) => {
      client.send(message);
    });
    res.status(200).json(updateOrAddFile);
  } catch (e) {
    if (e.code === "P2002") {
      console.log(
        "There is a unique constraint violation, a new group cannot be created with this name"
      );
      res.json("إسم القسم موجود مسبقاً");
    }
  }
});

// API To Update The Database With The New Reply
router.put("/update-complain/:path", requireAuth, async (req, res) => {
  try {
    const pathParam = req.params.path;
    const data = req.body;
    const { user } = req;

    const existingFile = await prisma.file.findUnique({
      where: {
        path: pathParam,
      },
    });
    const isSameStatus = existingFile && existingFile.status === data.status;
    const isSameReply = existingFile && existingFile.info === data.info;
    const updateOrAddFile = await prisma.file.upsert({
      where: {
        path: pathParam,
      },
      update: {
        info: data.info,
        status: data.status,
        groupId: +user.groupId,
        userId: +user.id,
      },
      create: {
        path: pathParam,
        info: data.info,
        status: data.status,
        groupId: +user.groupId,
        userId: +user.id,
      },
    });

    if (!isSameStatus || !isSameReply) {
      let item = {
        type: "statusOrReply_changed",
        data: updateOrAddFile,
      };
      const message = JSON.stringify(item);
      wss.clients.forEach((client) => {
        client.send(message);
      });
    }
    res.status(200).json(updateOrAddFile);
  } catch (error) {
    console.error("Error updating database:", error);
    res.sendStatus(500);
  }
});

// API For Delete The Shakwa
router.post("/delete-complain/:path", requireAuth, async (req, res) => {
  try {
    const path = req.params.path;
    const hideFileOrAddItHidden = await prisma.file.upsert({
      where: {
        path: path,
      },
      update: {
        flag: 1,
      },
      create: {
        path: path,
        info: "",
        flag: 1,
      },
    });
    let item = {
      type: "user_file_delete",
      data: hideFileOrAddItHidden,
    };
    const message = JSON.stringify(item);
    wss.clients.forEach((client) => {
      client.send(message);
    });
    console.log(`File: ${path} is hided Successfuly`);
    res.status(200).json(hideFileOrAddItHidden);
  } catch (error) {
    console.error("Error hidding card:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
