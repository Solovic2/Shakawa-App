const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware");
const bcrypt = require("bcrypt");
const wss = require("../websocket");
const prisma = require("../prisma/prismaClient");
const multer = require("multer");
const XLSX = require("xlsx");
// Configure Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

wss.on("connection", (ws) => {
  console.log("WebSocket connected");
});
wss.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log("Port in Use");
  }
});
/* Users */
router.get("/users", isAdmin, async (req, res) => {
  try {
    const data = await prisma.user.findMany({
      include: {
        group: true,
      },
    });
    res.json(data);
  } catch (error) {
    console.log("Error While Getting All User : ", error);
  }
});
router.post("/addUser", isAdmin, async (req, res) => {
  try {
    const { username, password, role, group } = req.body.data;
    bcrypt.hash(password, 5, async function (err, hash) {
      try {
        const addNewUser = await prisma.user.create({
          data: {
            username: username,
            password: hash,
            role: role,
            groupId: group !== null ? +group : null,
          },
          select: {
            id: true,
            username: true,
            role: true,
            group: true,
          },
        });

        res.status(200).json(addNewUser);
      } catch (e) {
        if (e.code === "P2002") {
          console.log(
            "There is a unique constraint violation, a new user cannot be created with this username"
          );
          res
            .status(400)
            .json("هذا الموظف موجود مسبقاً الرجاء تغيير إسم المستخدم");
        }
        console.log(
          "Error While Adding New User : ",
          "هذا الموظف موجود مسبقاً الرجاء تغيير إسم المستخدم",
          e
        );
      }
    });
  } catch (error) {
    console.error("Error updating database:", error);
    res.sendStatus(500);
  }
});
router.get("/edit-user/:id", isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await prisma.user.findUnique({
      where: {
        id: +id,
      },
    });
    res.json(data);
  } catch (error) {
    console.log("Error While Editing User : ", error);
  }
});
router.put("/update-user/:id", isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { oldUsername, username, password, role, group } = req.body.data;
    const user = await prisma.user.findUnique({
      where: {
        username: oldUsername,
      },
    });
    let hashPassword = password;
    if (password !== "") {
      bcrypt.hash(password, 10, async function (err, hash) {
        hashPassword = hash;
        try {
          const updateUser = await prisma.user.update({
            where: {
              id: +id,
            },
            data: {
              username: username,
              password: hashPassword,
              role: role,
              groupId: group !== null ? +group : null,
            },
          });
          const match = await bcrypt.compare(
            updateUser.password,
            user.password
          );
          // Case : Group Changed
          if (user && user.groupId !== +group) {
            let item = {
              type: "user_changed_group",
              data: updateUser,
            };
            const message = JSON.stringify(item);
            wss.clients.forEach((client) => {
              client.send(message);
            });
          } else if (user && user.role !== role) {
            // Case : Role Changed
            let item = {
              type: "user_changed_role",
              data: updateUser,
            };
            const message = JSON.stringify(item);
            wss.clients.forEach((client) => {
              client.send(message);
            });
          } else if (
            (user && user.username !== updateUser.username) ||
            !match
          ) {
            // Case : Username Or Password Changed
            let item = {
              type: "user_changed_username_password",
              data: updateUser,
            };
            const message = JSON.stringify(item);
            wss.clients.forEach((client) => {
              client.send(message);
            });
          }
          res.json(updateUser);
        } catch (error) {
          if (error.code === "P2002") {
            console.log(
              "There is a unique constraint violation, an Update username cannot be created with this name"
            );
            res.status(400).json({ error: "هذا المستخدم موجود من قبل" });
            console.log("Error : ", "هذا المستخدم موجود من قبل", error);
          } else {
            console.log("Error While Updating User : ", error);
          }
        }
        console.log(`User : ${username} Updated With New Password!`);
      });
    } else {
      try {
        const updateUser = await prisma.user.update({
          where: {
            id: +id,
          },
          data: {
            username: username,
            role: role,
            groupId: group !== null ? +group : null,
          },
        });
        if (user && user.groupId !== +group) {
          // Case : Group Changed
          let item = {
            type: "user_changed_group",
            data: updateUser,
          };
          const message = JSON.stringify(item);
          wss.clients.forEach((client) => {
            client.send(message);
          });
        }
        if (user && user.role !== role) {
          // Case : Role Changed
          let item = {
            type: "user_changed_role",
            data: updateUser,
          };
          const message = JSON.stringify(item);
          console.log(wss.clients);
          wss.clients.forEach((client) => {
            client.send(message);
          });
        } else if (user && user.username !== updateUser.username) {
          // Case : Username Or Password Changed
          let item = {
            type: "user_changed_username_password",
            data: updateUser,
          };
          const message = JSON.stringify(item);
          wss.clients.forEach((client) => {
            client.send(message);
          });
        }
        res.json(updateUser);
        console.log(`User : ${username} Updated With Same Password!`);
      } catch (error) {
        if (error.code === "P2002") {
          console.log(
            "There is a unique constraint violation, an Update username cannot be created with this name"
          );
          res.status(400).json({ error: "هذا المستخدم موجود من قبل" });
          console.log("Error : ", "هذا المستخدم موجود من قبل", error);
        } else {
          console.log("Error While Updating User : ", error);
        }
      }
    }
  } catch (error) {
    console.error("Error updating database:", error);
    res.sendStatus(500);
  }
});
router.delete("/delete-user/:id", isAdmin, async (req, res) => {
  try {
    const deleteUser = await prisma.user.delete({
      where: {
        id: +req.params.id,
      },
    });
    let item = {
      // Case : User Deleted
      type: "user_changed_role",
      data: deleteUser,
    };
    const message = JSON.stringify(item);
    console.log(wss.clients);
    wss.clients.forEach((client) => {
      client.send(message);
    });
    res.json(deleteUser);
  } catch (error) {
    console.log("Error deleting card: ", error);
    res.status(500).send("Internal server error");
  }
});
/* Groups */
router.get("/groups", isAdmin, async (req, res) => {
  try {
    const data = await prisma.group.findMany();
    res.json(data);
  } catch (error) {
    console.log("Error getting all groups : ", error);
  }
});
router.post("/addGroup", isAdmin, async (req, res) => {
  try {
    const { name } = req.body.data;
    const createGroup = await prisma.group.create({
      data: {
        name: name,
      },
    });
    res.json(createGroup);
  } catch (error) {
    if (error.code === "P2002") {
      console.log(
        "There is a unique constraint violation, a new group cannot be created with this name"
      );
      res.status(400).json({ error: "إسم القسم موجود مسبقاً" });
      console.log("Error : ", "إسم القسم موجود مسبقاً", error);
    } else {
      console.log("Error While Creating Group: ", error);
    }
  }
});
router.get("/edit-group/:id", isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await prisma.group.findUnique({
      where: {
        id: +id,
      },
    });
    res.json(data);
  } catch (error) {
    console.log("Error in editing Group while Find Group Id : ", error);
  }
});

router.put("/update-group/:id", isAdmin, async (req, res) => {
  const id = req.params.id;
  const name = req.body.data.name;
  try {
    // Check if Group name is already in DB
    const groupName = await prisma.group.findUnique({
      where: {
        name: name,
      },
    });
    const data = await prisma.group.update({
      where: {
        id: +id,
      },
      data: {
        name: name,
      },
    });
    /* if Group name isn't in DB thats means it's a new Group name which means we should send a websocket for all users to log them out because the group is Changed!.*/
    if (groupName === null) {
      let item = {
        type: "user_changed_group",
        data: data,
      };
      const message = JSON.stringify(item);
      console.log(wss.clients);
      wss.clients.forEach((client) => {
        client.send(message);
      });
    }
    res.json(data);
  } catch (error) {
    if (error.code === "P2002") {
      console.log(
        "There is a unique constraint violation, an Update username cannot be created with this name"
      );
      res.status(400).json({ error: "إسم القسم موجود مسبقاً" });
      console.log("Error : ", "إسم القسم موجود مسبقاً", error);
    } else {
      console.log("Error while Updating Group : ", error);
    }
  }
});

router.delete("/delete-group/:id", isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await prisma.group.delete({
      where: {
        id: +id,
      },
    });
    // Send to websocket so that all users logged out.
    let item = {
      type: "user_changed_group",
      data: data,
    };
    const message = JSON.stringify(item);
    console.log(wss.clients);
    wss.clients.forEach((client) => {
      client.send(message);
    });
    res.json(data);
  } catch (error) {
    console.log("Error While Deleting Group :", error);
  }
});

/* Files APIS FOR POSTMAN TESTS */
router.post("/add-new-file", async (req, res) => {
  try {
    const data = req.body;
    const createFile = await prisma.file.create({
      data: {
        path: data.path,
        group: {
          connect: { id: +data.group },
        },
      },
    });
    console.log(createFile);
    res.json(createFile);
  } catch (e) {
    if (e.code === "P2002") {
      console.log(
        "There is a unique constraint violation, a new file cannot be created with this name"
      );
      res.status(400).json({ error: "هذا الفايل موجود مسبقاً" });
    }
  }
});
router.post("/update-file/", isAdmin, async (req, res) => {
  try {
    const data = req.body;
    const updateOrAddFile = await prisma.file.upsert({
      where: {
        path: data.path,
      },
      update: {
        flag: data.flag ? data.flag : 0,
        groupId: +data.group,
      },
      create: {
        path: data.path,
        flag: data.flag ? data.flag : 0,
        groupId: +data.group,
      },
    });
    res.status(200).json(updateOrAddFile);
  } catch (error) {
    if (error.code === "P2002") {
      console.log(
        "There is a unique constraint violation, a new file cannot be created with this name"
      );
      res.status(400).json({ error: "هذا الفايل موجود مسبقاً" });
      console.log("Error : ", "هذا الفايل موجود مسبقاً", error);
    } else {
      console.log("Error : ", error);
    }
  }
});

// Define your API endpoint for file upload
router.post("/upload-excel-sheet", upload.single("file"), async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    // Now, insert the data into your database using Prisma
    const createRecords = jsonData.map((row) => {
      // Format Date [التاريخ] from serial number  to dd-mm-yyy
      const date = new Date((parseInt(row["التاريخ"]) - 25569) * 86400 * 1000);
      let type = "Undefined";
      switch (row["الصفة"] + "") {
        case "عسكرى":
          type = "Soldier";
          break;

        case "مدنى":
          type = "Soldier";
          break;

        case "غير محدد":
          type = "Undefined";
          break;
        default:
          type = "Undefined";
      }
      return prisma.complaint.create({
        data: {
          name: row["الأسم"] + "",
          type: type + "",
          email: row["البريد"] ? row["البريد"] + "" : null,
          mobileNumber: "0" + row["التليفون"],
          SID: row["الرقم العسكرى"] ? row["الرقم العسكرى"] + "" : null,
          MID: row["رقم العضوية"] ? row["رقم العضوية"] + "" : null,
          complainText: row["الشكوى"] + "",
          complainDate: date,
        },
      });
    });

    await prisma.$transaction(createRecords);

    console.log(`Excel Data inserted: ${jsonData.length} records`);
    res.send(jsonData.length > 0);
  } catch (error) {
    console.error(error);
    res.status(400).send({
      message:
        "حدثت مشكلة اثناء تحميل الإكسيل شيت لقاعدة البيانات، الرجاء التأكد إذا كان الإكسيل شيت صحيح.",
    });
  }
});
module.exports = router;
