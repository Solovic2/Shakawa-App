const express = require("express");
const router = express.Router();
const fs = require("fs");
const { requireAuth } = require("../middleware");
const wss = require("../websocket");
const chokidar = require("chokidar");
const prisma = require("../prisma/prismaClient");
const { Role, Status } = require("@prisma/client");
const path = require("path");
const folderPath = process.env.FOLDER_PATH;

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
const watcher = chokidar.watch(folderPath , {
  persistent: true,
  ignoreInitial: true,
  usePolling: true,
});
watcher
  .on("add", async (path) => {
    console.log(`File ${path} has been added`);
    if (!path.includes("tmp1")) {
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

    if (!path.includes("tmp1")) {
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
  info.push(splitter[0]);
  info.push(splitter[1] + "-" + splitter[2] + "-" + splitter[3]);
  info.push(path[path.length - 1]);
  return info;
};

// Get Files With Last Modified And  Texts from Database
async function getSortedFilesAndRecordsByDate(
  directoryPath,
  searchQuery,
  skip,
  pageSize
) {
  // Create an array to store all data from db and files information
  let allRecords = [];
  let where; // Define a condition for filtering
  let countDB = 0;

  /*****  Get Files From OS and Paginate on it *****/
  let files = await fs.promises.readdir(directoryPath);
  if (searchQuery !== "*") {
    // If searchQuery is not empty, check if it's a date or a mobile number
    files = files.filter((file) => file.includes(searchQuery));
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (dateRegex.test(searchQuery)) {
      // If it's a date, filter by the date
      where = {
        complainDate: {
          equals: new Date(searchQuery),
        },
      };
    } else {
      // If it's a mobile number, filter by mobile
      where = {
        mobileNumber: {
          equals: searchQuery,
        },
      };
    }
  }
  
  // // Iterate through the files
  files.forEach((file) => {
    const regex = /(\d{2})-(\d{2})-(\d{4})/;
    const match = file.match(regex);
    if (match) {
      allRecords.push({
        path: file,
        data: null,
        date: new Date(match[3], match[2] - 1, match[1]),
      });
    } else {
      console.log("Date not found in File");
    }
  });

  /*****  Get Text Data From Database and Paginate on it *****/
  const paginatedTexts = await prisma.complaint.findMany({
    where,
  });
  // Read Texts From Database , Date is On yyyy-mm-dd form
  paginatedTexts.forEach((text) => {
    const regex = /(\d{4})-(\d{2})-(\d{2})/;
    const date = text.complainDate.toISOString() + "";
    const match = date.match(regex); // to make it string
    if (match) {
      allRecords.push({
        // Make Path unique as id\mobile-dd-mm-yy.txt because db could has more than field with same name and date
        path:
          text.id +
          "\\" +
          text.mobileNumber +
          "-" +
          match[3] +
          "-" +
          match[2] +
          "-" +
          match[1] +
          ".txt",
        data: text, // Data Of Database
        date: new Date(match[1], match[2] - 1, match[3]),
      });
    }
  });

  if (!searchQuery.match(/^\d{2}-\d{2}-\d{4}$/)) {
    // Sort By Date When Mobile or Getting All Data
    allRecords.sort((a, b) => b.date - a.date); // Sort data by date in descending order
  }

 
  // console.log(allRecords);
  // Get Total Data number in Database and Files For Pagination
  if (searchQuery !== "*") {
    countDB = await prisma.complaint.count({
      where,
    });
  } else {
    countDB = await prisma.complaint.count();
  }

  allRecords = allRecords.slice(skip , (skip + parseInt(pageSize)))
  const total = countDB + files.length;
  return { allRecords, total };
}
// Read Files And Records In Database and return it.
async function readAllFiles(folderPath, searchQuery = "*", skip, pageSize) {
  try {
    let allFiles = [];
    let paths = [];
    let data = [];
    const { allRecords, total } = await getSortedFilesAndRecordsByDate(
      folderPath,
      searchQuery,
      skip,
      pageSize
    );
    for (let i = 0; i < allRecords.length; i++) {
      paths.push(allRecords[i].path);
      data.push(allRecords[i].data);
    }
    if (paths.length > 0) {
      const disabledFiles = await prisma.file.findMany({
        where: {
          path: {
            in: paths,
          },
        },
        include: {
          user: true,
        },
      });
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const splittedData = splitPath(path);

        // Check if path exists in disabledFiles
        const element = disabledFiles.find((df) => df.path === path);
        if (element !== undefined && element.flag !== 1) {
          const fileData = {
            path: path,
            record: data[i],
            info: element.info,
            mobile: splittedData[0],
            fileDate: splittedData[1],
            fileType: splittedData[2],
            repliedBy: element.user ? element.user.username : null,
            groupId: element.groupId,
            status: element.status,
          };
          allFiles.push(fileData);
        } else if (element === undefined) {
          const fileData = {
            path: path,
            info: "",
            record: data[i],
            mobile: splittedData[0],
            fileDate: splittedData[1],
            fileType: splittedData[2],
            repliedBy: null,
            groupId: null,
            status: Status.ON_UNSEEN,
          };
          allFiles.push(fileData);
        }
      }
    }
    // console.log(allFiles);
    return { allFiles, total };
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

async function getSpecifiedFiles(user, searchQuery, skip, pageSize) {

  let whereOption;
   if (searchQuery !== "*") {
    // If searchQuery is not empty, check if it's a date or a mobile number
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (dateRegex.test(searchQuery)) {
      // If it's a date, filter by the date
      whereOption.complainDate = {
          equals: new Date(searchQuery),
        }
      
    } else {
      // If it's a mobile number, filter by mobile
      whereOption.mobileNumber = {
          equals: searchQuery,
        };
    }
  }
  const files = await prisma.file.findMany({
    where: {
      flag: 0,
      group: {
        id: +user.groupId,
      },
      ...whereOption,

    },
    skip,
    take: parseInt(pageSize),
    include: {
      user: true,
      complaint: true,
    },
  });
  let allFiles = [];

  for (let i = 0; i < files.length; i++) {
    const path = files[i].path;
    const data = splitPath(path);
    const fileData = {
      path: path,
      record: files[i].complaint,
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
  const total =  await prisma.file.count({where: {
    flag: 0,
    group: {
      id: +user.groupId,
    },
    ...whereOption,

  },})
  return {allFiles, total};
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
router.get("/:searchQuery/:page/:pageSize", requireAuth, async (req, res) => {
  const { user } = req;
  const { searchQuery, page, pageSize } = req.params;
  const skip = (page - 1) * pageSize;
  if (user.role === Role.User) {
    const {allFiles, total} = await getSpecifiedFiles(user, searchQuery, skip, pageSize);
    res.json({allFiles, total});
  } else {
    fs.access(folderPath, fs.constants.F_OK, async (err) => {
      if (err) {
        res.status(400).json("تأكد من اتصالك بفولدر الصوتيات من عند الخادم");
        return;
      } else {
        const { allFiles, total } = await readAllFiles(
          folderPath,
          searchQuery,
          skip,
          pageSize
        );
        res.json({ allFiles, total });
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
// router.get("/dateToday/:date", requireAuth, async (req, res) => {
//   try {
//     const date = req.params.date;
//     const { user } = req;
//     let files = [];
//     if (user.role === Role.User) {
//       files = await getSpecifiedFiles(user);
//     } else {
//       files = await readAllFiles(folderPath);
//     }
//     const data = getDataToday(files, date);
//     res.json(data);
//   } catch (error) {
//     console.error("Error updating database:", error);
//     res.sendStatus(500);
//   }
// });

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
  const filePath = folderPath + "\\" + req.params.filePath;
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
        status: Status.ON_STUDY,
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
        complaintId: data.record !== null ? +data.record : null,
        status: Status.ON_STUDY,
      },
    });
    const splitData = splitPath(data.path);
    let record = null;
    if (data.record !== null) {
      record = await prisma.complaint.findUnique({
        where: {
          id: +data.record,
        },
      });
    } else {
      record = null;
    }
    updateOrAddFile.mobile = splitData[0];
    updateOrAddFile.fileDate = splitData[1];
    updateOrAddFile.fileType = splitData[2];
    updateOrAddFile.repliedBy = null;
    updateOrAddFile.record = record;
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
