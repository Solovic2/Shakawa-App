// MiddleWare
const jwt = require('jsonwebtoken');
const prisma = require("./prisma/prismaClient");
const requireAuth = async (req, res, next) => {
    const  userSession  = req.signedCookies.user;
    const userCookie = userSession ? (userSession) : false;
    if(userCookie){
        const userToken = jwt.verify(userCookie, process.env.SECRET_KEY);
        const user = await prisma.user.findUnique({
          where:{
            id: userToken.id
          }
        });
        if (user && user.role === userToken.role
            ) {
          // User is authenticated, proceed to next middleware
          req.user = user;
          return next();
        } else {
          // User is not authenticated, return unauthorized response
          return res.status(401).json({ error: "Unauthorized" });
        }
    }else {
        // User is not authenticated, return unauthorized response
        return res.status(401).json({ error: "User not found" });
      }
    
  };
const isAdmin = async (req, res, next) => {
    const  userSession  = req.signedCookies.user;
    const userCookie = userSession ? (userSession) : false;
    if(userCookie){
        const userToken = jwt.verify(userCookie, process.env.SECRET_KEY);
        const user = await prisma.user.findUnique({
          where:{
            id: userToken.id
          }
        });
        if (user && user.role === userToken.role && user.role === 'Admin'
            ) {
          // User is authenticated, proceed to next middleware
          req.user = user;
          return next();
        } else {
          // User is not authenticated, return unauthorized response
          return res.status(401).json({ error: "Unauthorized" });
        }
    }else {
        // User is not authenticated, return unauthorized response
        return res.status(401).json({ error: "User not found" });
      }
    
  };
  
module.exports =  {requireAuth, isAdmin};