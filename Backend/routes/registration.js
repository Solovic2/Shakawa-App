const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = require("../prisma/prismaClient");
router.post("/register", async (req, res) => {
  try {
    const body = req.body.data;
    const saltRounds = 5;
    console.log(body);
    bcrypt.hash(body.password, saltRounds, async function (err, hash) {
      if (err) {
        console.log(err);
        res.status(400).send(err);
        return;
      }
      try {
        const createUser = await prisma.user.create({
          data: {
            username: body.username,
            password: hash,
            role: body.role,
            group: {
              connect: { id: +body.group },
            },
          },
          select: {
            id: true,
            username: true,
            role: true,
            group: true,
          },
        });

        const options = {
          httpOnly: false,
          secure: false,
          signed: true,
          maxAge: 1000 * 60 * 60 * 24, // 1 day
        };
        const token = jwt.sign( createUser , process.env.SECRET_KEY);

        res.cookie("user", token, options);
        console.log(res);
        res.status(200).json(createUser);
      } catch (e) {
        if (e.code === "P2002") {
          console.log(
            "There is a unique constraint violation, a new user cannot be created with this username"
          );
          res
            .status(400)
            .json("هذا الموظف موجود مسبقاً الرجاء تغيير إسم المستخدم");
        }
        console.log(`An Error Occur ${e}`);
      }
    });
  } catch (error) {
    console.error("Error in database:", error);
    res.sendStatus(500);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body.data;
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      include:{
        group:true,
      }
    });

    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        delete user.password;
        const options = {
          httpOnly: false,
          secure: false,
          signed: true,
          maxAge: 1000 * 60 * 60 * 24, // 1 day
        };
        const token = jwt.sign( user , process.env.SECRET_KEY);
        res.cookie("user", token, options);
        res.status(200).json(user);
      } else {
        res.status(400).json({ error: "كلمة السر غير صحيحة" });
      }
    } else {
      res
        .status(400)
        .json({ error: "إسم المستخدم ليس موجوداً الرجاء تسجيل الدخول" });
    }
  } catch (error) {
    console.error("Error in database:", error);
    res.sendStatus(500);
  }
});

router.post("/addGroup", async (req, res) => {
  try {
    const data = req.body;
    const createGroup = await prisma.group.create({
      data: data,
    });
    res.json(createGroup);
  } catch (e) {
    if (e.code === "P2002") {
      console.log(
        "There is a unique constraint violation, a new group cannot be created with this name"
      );
      res.json("إسم القسم موجود مسبقاً");
    }
  }
});
module.exports = router;
