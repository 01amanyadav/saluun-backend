const { createService, getServicesBySalon, getServiceById, updateService, deleteService } = require("../models/serviceModel");
const { getSalonById } = require("../models/shopModel");
const asyncHandler = require("../utils/asyncHandler");

const createNewService = asyncHandler(async (req, res) => {
    const { salonId, name, description, price, durationMinutes } = req.body;

    if (!salonId || !name || !price || !durationMinutes) {
        const error = new Error("Salon ID, name, price, and duration are required");
        error.status = 400;
        throw error;
    }

    const salon = await getSalonById(salonId);
    if (!salon) {
        const error = new Error("Salon not found");
        error.status = 404;
        throw error;
    }

    if (salon.owner_id !== req.user.id && req.user.role !== "admin") {
        const error = new Error("Unauthorized to add services to this salon");
        error.status = 403;
        throw error;
    }

    const service = await createService(salonId, name, description, price, durationMinutes);
    res.status(201).json(service);
});

const getSalonServices = asyncHandler(async (req, res) => {
    const { salonId } = req.params;

    const salon = await getSalonById(salonId);
    if (!salon) {
        const error = new Error("Salon not found");
        error.status = 404;
        throw error;
    }

    const services = await getServicesBySalon(salonId);
    res.json(services);
});

const getService = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const service = await getServiceById(id);
    if (!service) {
        const error = new Error("Service not found");
        error.status = 404;
        throw error;
    }

    res.json(service);
});

const updateServiceDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, price, durationMinutes } = req.body;

    const service = await getServiceById(id);
    if (!service) {
        const error = new Error("Service not found");
        error.status = 404;
        throw error;
    }

    const salon = await getSalonById(service.salon_id);
    if (salon.owner_id !== req.user.id && req.user.role !== "admin") {
        const error = new Error("Unauthorized to update this service");
        error.status = 403;
        throw error;
    }

    const updatedService = await updateService(id, name, description, price, durationMinutes);
    res.json(updatedService);
});

const deleteServiceById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const service = await getServiceById(id);
    if (!service) {
        const error = new Error("Service not found");
        error.status = 404;
        throw error;
    }

    const salon = await getSalonById(service.salon_id);
    if (salon.owner_id !== req.user.id && req.user.role !== "admin") {
        const error = new Error("Unauthorized to delete this service");
        error.status = 403;
        throw error;
    }

    const deletedService = await deleteService(id);
    res.json(deletedService);
});

module.exports = {
    createNewService,
    getSalonServices,
    getService,
    updateServiceDetails,
    deleteServiceById
};
