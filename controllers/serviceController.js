const asyncHandler = require("../utils/asyncHandler");
const { formatSuccessResponse } = require("../utils/response");
const ServiceManagementService = require("../services/serviceManagementService");


const getAllServices = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await ServiceManagementService.getAllServicesWithPagination(page, limit);
    res.json(formatSuccessResponse(result, "All services fetched"));
});


const createNewService = asyncHandler(async (req, res) => {
    const { salonId, name, description, price, durationMinutes } = req.body;
    const ownerId = req.user.id;

    const serviceData = { name, description, price, durationMinutes };
    const service = await ServiceManagementService.createNewService(salonId, ownerId, serviceData);

    res.status(201).json(formatSuccessResponse(service, "Service created successfully"));
});


const getSalonServices = asyncHandler(async (req, res) => {
    const { salonId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await ServiceManagementService.getSalonServicesWithPagination(salonId, page, limit);
    res.json(formatSuccessResponse(result, "Salon services fetched"));
});


const getService = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const service = await ServiceManagementService.getServiceDetails(id);
    res.json(formatSuccessResponse(service, "Service details fetched"));
});


const updateServiceDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const ownerId = req.user.id;

    const updatedService = await ServiceManagementService.updateServiceInfo(id, ownerId, req.body);
    res.json(formatSuccessResponse(updatedService, "Service updated successfully"));
});


const deleteServiceById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const ownerId = req.user.id;

    const deletedService = await ServiceManagementService.deleteServiceInfo(id, ownerId);
    res.json(formatSuccessResponse(deletedService, "Service deleted successfully"));
});


module.exports = {
    getAllServices,
    createNewService,
    getSalonServices,
    getService,
    updateServiceDetails,
    deleteServiceById
};
