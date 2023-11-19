const express = require("express");
const router = express.Router();
const fs = require("fs");
const { requireAuth } = require("../middleware");
const wss = require("../websocket");
const chokidar = require("chokidar");
const prisma = require("../prisma/prismaClient");
const { Role, Status } = require("@prisma/client");
const globalPath = require("path");
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
const watcher = chokidar.watch(folderPath, {
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
          path: globalPath.basename(path),
          info: "",
          record: null,
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
    // let deleteData = null;
    // try {
    //   deleteData = await prisma.file.delete({
    //     where: {
    //       path: globalPath.basename(path),
    //     },
    //   });
    // } catch (error) {}

    // if (!path.includes("tmp1")) {
    //   let message = {
    //     type: "delete",
    //     data: {
    //       path: globalPath.basename(path),
    //       groupId: deleteData ? deleteData.groupId : null,
    //     },
    //   };
    //   wss.clients.forEach((client) => {
    //     client.send(JSON.stringify(message));
    //   });
    // }
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
  info.push(new Date(splitter[3] + "-" + splitter[2] + "-" + splitter[1]));

  return info;
};
// Format Path For Complain Text Table
const formatComplaintPath = (text) => {
  const regex = /(\d{4})-(\d{2})-(\d{2})/;
  const date = text.complainDate.toISOString();
  const match = date.match(regex);

  if (match) {
    return `${text.id}\\${text.mobileNumber}-${match[3]}-${match[2]}-${match[1]}.txt`;
  }

  return "";
};
// Get Files With Last Modified And  Texts from Database
async function getSortedFilesAndRecordsBySearchQueryAndFilter(
  directoryPath,
  filterBy,
  searchQuery,
  skip,
  pageSize
) {
  // Create an array to store all data from db and files information
  let allRecords = [];
  let total = 0;
  let where; // Define a condition for filtering
  let countDB = 0;
  let filteredFiles = [];
  try {
    let osFiles = await fs.promises.readdir(directoryPath); // Variable To Store  Files From OS .
    let filteredComplaintText; //  Variable To Store ComplainTexts From DB .
    let isDate = false; // Boolean to check if searchQuery is Date Or not.
    let splitDate; // Split SearchQuery if It's Date.
    filteredFiles = osFiles; // Make FilterFiles equal OsFiles in the beginning.

    /****  1. Get OS Files and ComplainTexts Based On Search Query  ****/
    if (searchQuery !== "*") {
      /*** 1.1. Set Where Condition Of SearchQuery for Complaint Table. ***/
      // If searchQuery is not empty, check if it's a date or a mobile number
      const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
      if (dateRegex.test(searchQuery)) {
        isDate = true;
        // If it's a date, set where search by the date
        where = {
          complainDate: {
            equals: new Date(searchQuery),
          },
        };
      } else if (!searchQuery.startsWith("#")) {
        isDate = false;
        // If it's a mobile number, set where search by mobile
        where = {
          mobileNumber: {
            equals: searchQuery,
          },
        };
      }
      /*** 1.2.  Filter Files  With searchQuery. ***/
      filteredFiles = [];
      // Split SearchQuery if It's Date
      if (isDate) splitDate = searchQuery.split("-");
      // If SearchQuery is Date Or Mobile and Not Code ID (#ID) Push it.
      // If SearchQuery is Code ID (#ID) Push All Data
      osFiles.forEach(async (element) => {
        if (isDate) {
          if (
            element.includes(
              splitDate[2] + "-" + splitDate[1] + "-" + splitDate[0]
            )
          ) {
            filteredFiles.push(element);
          }
        } else if (
          (!searchQuery.startsWith("#") && element.includes(searchQuery)) ||
          searchQuery.startsWith("#")
        ) {
          filteredFiles.push(element);
        }
      });
    }
    /*** 1.3.  Filter Complaint Table  With searchQuery. ***/
    filteredComplaintText = await prisma.complaint.findMany({
      where,
    });
    /****  End Of No.1  ****/

    /****  2. Get FilteredFiles and Filtered ComplainTexts By Search Query Based On filterBy condition.  ****/
    if (filterBy === "ON_UNSEEN") {
      /*** 2.1 If Status = ON_UNSEEN  ***/
      const complaintPaths = filteredComplaintText.map(formatComplaintPath);

      // Get All Records From File Table which is Not UnSeen (Is Seen with status [On_Hold,On_Solve,On_Study]).
      const filesWithNotUnSeenStatus = await prisma.file.findMany({
        where: {
          NOT: {
            status: filterBy,
          },
          OR: [
            {
              path: {
                in: filteredFiles,
              },
            },
            {
              path: {
                in: complaintPaths,
              },
            },
          ],
        },
        select: {
          path: true,
        },
      });
      const notUnSeenStatusPaths = filesWithNotUnSeenStatus.map(
        (file) => file.path
      );

      // Get UnSeen FilteredFiles (OS FILES) By Filter out the filteredFiles that doesn't match the notUnSeenStatusPaths
      const unSeenFiles = filteredFiles.filter(
        (file) => !notUnSeenStatusPaths.includes(file)
      );
      // Get UnSeen filteredComplaintText (Complain Table) by Filter out the complainTexts that match the notUnSeenStatusPaths
      const unSeenComplainText = filteredComplaintText.filter((text) => {
        const path = formatComplaintPath(text);
        return !notUnSeenStatusPaths.includes(path);
      });
      // Fill AllRecords Array with unSeenFiles and unSeenComplainText  ......
      unSeenFiles.forEach((file) => {
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
      unSeenComplainText.forEach((text) => {
        const path = formatComplaintPath(text);
        if (path) {
          allRecords.push({
            path: path, // Make Path unique as id\mobile-dd-mm-yy.txt because db could has more than field with same name and date
            data: text, // Data Of Database
            date: new Date(text.complainDate),
          });
        }
      });

      allRecords.sort((a, b) => b.date - a.date); // Sort allRecords array by date in descending order
      total = unSeenFiles.length + unSeenComplainText.length;
    } else {
      /*** 2.2 If Status != ON_UNSEEN ***/
      //  Fill allRecords Array with filteredFiles
      filteredFiles.forEach((file) => {
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
      // Fill allRecords Array with filteredComplaintText
      filteredComplaintText.forEach((text) => {
        const path = formatComplaintPath(text);
        if (path) {
          allRecords.push({
            path: path, // Make Path unique as id\mobile-dd-mm-yy.txt because db could has more than field with same name and date
            data: text, // Data Of Database
            date: new Date(text.complainDate),
          });
        }
      });

      allRecords.sort((a, b) => b.date - a.date); // Sort data by date in descending order

      // Get Total Data number in Database and Files For Pagination
      countDB = await prisma.complaint.count({
        where,
      });
    }
    /****  End Of No.2  ****/
    /*** 3. Return allRecords that not hided in File Table  ***/
    /*** 3.1 If Search Query is code (#ID) return only allRecords that are not hided and id equal code ID ***/
    let searchQueryById;
    if (searchQuery.startsWith("#")) {
      searchQueryById = searchQuery.slice(1);
      const file = await prisma.file.findUnique({
        where: {
          id: +searchQueryById,
          flag: 0,
        },
        select: {
          path: true,
        },
      });

      allRecords = allRecords.filter((record) => record.path === file?.path);
      allRecords = allRecords.slice(skip, skip + parseInt(pageSize));
      total = allRecords.length;
      return { allRecords, total };
    }
    /*** 3.2 return allRecords that are not hided ***/
    const dataWithFlagOne = await prisma.file.findMany({
      where: {
        flag: 1,
      },
      select: {
        path: true,
      },
    });

    const pathsWithFlagOne = dataWithFlagOne.map((record) => record.path);
    allRecords = allRecords.filter(
      (record) => !pathsWithFlagOne.includes(record.path)
    );

    total = allRecords.length;

    allRecords = allRecords.slice(skip, skip + parseInt(pageSize));
    if (allRecords.length > 0) {
      if (filterBy !== "ON_UNSEEN") {
        total = countDB + filteredFiles.length - pathsWithFlagOne.length;
      }
    } else {
      total = 0;
    }
    /*** 3. End Of No.3  ***/
    return { allRecords, total };
  } catch (error) {
    console.log("Error : ", error);
  }
}

// Get Data Attached From Database For User (with filter status)
async function getUserAttachedData(
  user,
  filterBy,
  searchQuery,
  skip,
  pageSize
) {
  const where = {
    flag: 0,
    group: {
      id: +user.groupId,
    },
  };
  if (searchQuery !== "*") {
    const dateRegex = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    const match = searchQuery.match(dateRegex);
    if (match) {
      // If it's a date, filter by the date
      where.path = {
        contains: match[3] + "-" + match[2] + "-" + match[1],
      };
    } else if (!searchQuery.startsWith("#")) {
      where.path = {
        contains: searchQuery,
      };
    } else {
      where.id = {
        equals: +searchQuery.slice(1),
      };
    }
  }
  if (filterBy !== "null") {
    where.status = filterBy;
  }

  const files = await prisma.file.findMany({
    where,
    orderBy: {
      fileDate: "desc", // 'desc' for descending order (most recent first)
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
    const fileData = {
      id: files[i].id,
      path: path,
      record: files[i].complaint,
      info: files[i].info,
      mobile: files[i].mobile,
      fileDate:
        files[i].fileDate !== null
          ? `${files[i].fileDate.getDate().toString().padStart(2, "0")}-${(
              files[i].fileDate.getMonth() + 1
            )
              .toString()
              .padStart(2, "0")}-${files[i].fileDate.getFullYear()}`
          : null,
      fileType: files[i].fileType,
      repliedBy: files[i].user ? files[i].user.username : null,
      groupId: files[i].groupId,
      status: files[i].status,
    };
    allFiles.push(fileData);
  }
  const total = await prisma.file.count({
    where,
  });
  return { allFiles, total };
}
// Read Files And Records In Database and return it.
async function readAllFiles(
  folderPath,
  filterBy,
  searchQuery = "*",
  skip,
  pageSize
) {
  try {
    let allFiles = [];
    let paths = [];
    let data = [];
    // This needs treat with file system with db (OS and Complaint, File Tables)
    if (filterBy === "null" || filterBy === "ON_UNSEEN") {
      const { allRecords, total } =
        await getSortedFilesAndRecordsBySearchQueryAndFilter(
          folderPath,
          filterBy,
          searchQuery,
          skip,
          pageSize
        );
      // Fill Data and Send It To Frontend
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
            flag: 0,
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
              id: element.id,
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
              id: null,
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
      return { allFiles, total };
    } else {
      // This treats only with DB (File Table)
      // IF STATUS IS NOT UNSEEN (All File Table Status not UNSEEN ).
      allFiles = [];
      let where = {
        flag: 0,
        status: filterBy,
      };
      if (searchQuery !== "*") {
        // If Search By Date
        if (searchQuery.match(/^\d{2}-\d{2}-\d{4}$/)) {
          const [day, month, year] = searchQuery.split("-");
          where.fileDate = new Date(year, month - 1, day);
        } else if (!searchQuery.startsWith("#")) {
          // If Search By Number
          where.mobile = searchQuery;
        } else {
          where.id = +searchQuery.slice(1);
        }
      }

      const filterStatusData = await prisma.file.findMany({
        where,
        orderBy: {
          fileDate: "desc", // 'desc' for descending order (most recent first)
        },
        skip,
        take: parseInt(pageSize),
        include: {
          user: true,
          complaint: true,
        },
      });
      for (let i = 0; i < filterStatusData.length; i++) {
        const path = filterStatusData[i].path;
        const fileData = {
          id: filterStatusData[i].id,
          path: path,
          record: filterStatusData[i].complaint,
          info: filterStatusData[i].info,
          mobile: filterStatusData[i].mobile,
          fileDate:
            filterStatusData[i].fileDate !== null
              ? `${filterStatusData[i].fileDate
                  .getDate()
                  .toString()
                  .padStart(2, "0")}-${(
                  filterStatusData[i].fileDate.getMonth() + 1
                )
                  .toString()
                  .padStart(2, "0")}-${filterStatusData[
                  i
                ].fileDate.getFullYear()}`
              : null,
          fileType: filterStatusData[i].fileType,
          repliedBy: filterStatusData[i].user
            ? filterStatusData[i].user.username
            : null,
          groupId: filterStatusData[i].groupId,
          status: filterStatusData[i].status,
        };
        allFiles.push(fileData);
      }
      const total = await prisma.file.count({
        where,
      });
      return { allFiles, total };
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

function getContentType(fileName) {
  const fileExt = globalPath.extname(fileName).toLowerCase();
  switch (fileExt) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    // Add more cases for other image formats as needed
    default:
      return "application/octet-stream";
  }
}

async function getSummary(user) {
  let allItems = {
    onTotal: {
      _count: {
        status: 0,
      },
      status: "ON_TOTAL",
    },
    onHold: {
      _count: {
        status: 0,
      },
      status: "ON_HOLD",
    },
    onStudy: {
      _count: {
        status: 0,
      },
      status: "ON_STUDY",
    },
    onSolve: {
      _count: {
        status: 0,
      },
      status: "ON_SOLVE",
    },
  };

  let dbStatus;
  let countTotalStatus = 0;
  if (user.role !== Role.User) {
    dbStatus = await prisma.file.groupBy({
      where: {
        flag: 0,
      },
      by: ["status"],
      _count: {
        status: true,
      },
    });
  } else {
    dbStatus = await prisma.file.groupBy({
      where: {
        flag: 0,
        groupId: +user.groupId,
      },
      by: ["status"],
      _count: {
        status: true,
      },
    });
  }

  dbStatus.forEach((element) => {
    countTotalStatus += element._count.status;
  });
  if (user.role !== Role.User) {
    const allHiddenFiles = await prisma.file.count({
      where: {
        flag: 1,
      },
    });
    const allDBComplaintTable = await prisma.complaint.count();

    try {
      const files = await fs.promises.readdir(folderPath);
      allItems.onTotal._count.status =
        files.length + allDBComplaintTable - allHiddenFiles; // Update the count to the desired value
    } catch (error) {
      console.log("Error : ", error);
    }

    // allItems.onTotal._count.status =
    //   files.length + allDBComplaintTable - allHiddenFiles; // Update the count to the desired value

    let countUnSeenStatus = allItems.onTotal._count.status;
    // Check if there is an element with status "ON_UNSEEN" in the dbStatus array
    const onUnseenElement = dbStatus.find(
      (element) => element.status === "ON_UNSEEN"
    );

    if (onUnseenElement) {
      // If "ON_UNSEEN" element is found, update item's _count.status property
      countUnSeenStatus += onUnseenElement._count.status;
    }

    allItems.onUnSeen = {
      _count: {
        status: countUnSeenStatus - countTotalStatus,
      },
      status: "ON_UNSEEN",
    };
  } else {
    allItems.onTotal._count.status = countTotalStatus; // Update the count to the desired value
  }
  for (let key in allItems) {
    if (allItems.hasOwnProperty(key)) {
      // Access the current property
      const element = allItems[key];
      const matchingItem = dbStatus.find(
        (item) => item.status === element.status
      );
      if (matchingItem) {
        // Update the _count value in the matching item
        element._count.status += matchingItem._count.status;
      }
    }
  }

  return Object.values(allItems);
}
// create a route to get data from the database
router.get(
  "/:filterBy/:searchQuery/:page/:pageSize",
  requireAuth,
  async (req, res) => {
    const { user } = req;
    const { filterBy, searchQuery, page, pageSize } = req.params;
    const skip = (page - 1) * pageSize;
    if (user.role === Role.User) {
      const { allFiles, total } = await getUserAttachedData(
        user,
        filterBy,
        searchQuery,
        skip,
        pageSize
      );

      res.json({ allFiles, total });
    } else {
      fs.access(folderPath, fs.constants.F_OK, async (err) => {
        if (err) {
          res.status(400).json("تأكد من اتصالك بفولدر الصوتيات من عند الخادم");
          return;
        } else {
          const { allFiles, total } = await readAllFiles(
            folderPath,
            filterBy,
            searchQuery,
            skip,
            pageSize
          );
          res.json({ allFiles, total });
        }
      });
    }
  }
);

router.get("/summary", requireAuth, async (req, res) => {
  const { user } = req;
  const summary = await getSummary(user);
  res.send(summary);
});
// API To Get Groups
router.get("/groups", async (req, res) => {
  const data = await prisma.group.findMany();
  res.json(data);
});

// API For Get The File Image
router.get("/file/:filePath", requireAuth, (req, res) => {
  const filePath = folderPath[1] + "\\" + req.params.filePath;
  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // Read the image file and convert it to a Base64 encoded string
    const fileData = fs.readFileSync(filePath, { encoding: "base64" });

    // Determine the content type based on the file extension
    const contentType = getContentType(req.params.filePath);

    // Send the Base64 encoded image data to the frontend
    res.json({ contentType, data: fileData });
  } else {
    res.status(404).send("File not found");
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
    const isNotSameGroupID =
      existingFile && existingFile.groupId !== +data.group;
    if (existingFile) {
      if (isNotSameGroupID) {
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
    }

    const splitData = splitPath(data.path);
    const updateOrAddFile = await prisma.file.upsert({
      where: {
        path: data.path,
      },
      update: updateData,
      create: {
        path: data.path,
        mobile: splitData[0],
        fileDate: splitData[3],
        fileType: splitData[2],
        groupId: +data.group,
        info: "",
        userId: null,
        complaintId: data.record !== null ? +data.record : null,
        status: Status.ON_STUDY,
      },
      include: {
        user: true,
      },
    });
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
    updateOrAddFile.repliedBy = null;
    updateOrAddFile.record = record;
    let item = {
      type: isNotSameGroupID ? "user_delete_add" : "user_add",
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
      include: { user: true },
    });
    updateOrAddFile.repliedBy = updateOrAddFile.user
      ? updateOrAddFile.user.username
      : null;

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
    const splitData = splitPath(path);
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
        mobile: splitData[0],
        fileDate: splitData[3],
        fileType: splitData[2],
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
