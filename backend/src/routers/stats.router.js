const { Router } =require( "express");
const { protectRoute } =require( "../middleware/auth.middleware");
const statsController = require("../controllers/stats.controller");
const statsRouter = Router();

console.log("Stats router file loaded");

statsRouter.get('/', (req, res, next) => {
    console.log("GET /api/stats hit");
    next();
},protectRoute, statsController.getVisitorsStats);

module.exports =statsRouter;