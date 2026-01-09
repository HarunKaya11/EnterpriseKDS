const requestLogger = (req, res, next) => {
    const time = new Date().toLocaleString();
    console.log(`[${time}] İstek: ${req.method} ${req.url}`);
    
    
    next(); 
};

module.exports = requestLogger;