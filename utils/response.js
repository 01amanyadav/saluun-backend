// Pagination helper
const getPaginationParams = (page = 1, limit = 10) => {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    return {
        page: pageNum,
        limit: limitNum,
        offset
    };
};

// Build pagination metadata
const buildPaginationMeta = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        currentPage: page,
        pageSize: limit,
        totalRecords: total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
};

// Format paginated response
const formatPaginatedResponse = (data, total, page, limit) => {
    return {
        success: true,
        data,
        pagination: buildPaginationMeta(total, page, limit)
    };
};

// Format success response
const formatSuccessResponse = (data, message = null) => {
    return {
        success: true,
        message,
        data
    };
};

// Format error response
const formatErrorResponse = (message, errors = null, statusCode = 500) => {
    return {
        success: false,
        message,
        errors,
        statusCode
    };
};

module.exports = {
    getPaginationParams,
    buildPaginationMeta,
    formatPaginatedResponse,
    formatSuccessResponse,
    formatErrorResponse
};
