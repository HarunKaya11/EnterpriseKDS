const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/getTopMaintenanceCars', dashboardController.getTopMaintenanceCars);
router.get('/getTopRentedCars', dashboardController.getTopRentedCars);
router.get('/getCommonCars', dashboardController.getCommonCars);
router.get('/getCarFinancialData', dashboardController.getCarFinancialData);
router.get('/getAllCars', dashboardController.getAllCars);
router.get('/getBottomRentedCars', dashboardController.getBottomRentedCars);
router.get('/getTopCostLowMaintenanceCars', dashboardController.getTopCostLowMaintenanceCars);
router.get('/getCommonCarsForGraphs', dashboardController.getCommonCarsForGraphs);
module.exports = router;