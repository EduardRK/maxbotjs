const verifyMaxInitData = (initData) => {
  return true;
};

const maxAuthMiddleware = (req, res, next) => {
  const initDataHeader = req.headers['x-max-initdata'];
  
  if (initDataHeader) {
    try {
      const initData = JSON.parse(initDataHeader);
      
      if (verifyMaxInitData(initData)) {
        req.maxUser = initData.user;
        req.maxInitData = initData;
        req.isMaxApp = true;
        req.maxUserId = initData.user.id.toString();
      }
    } catch (error) {
      console.log('Invalid MAX init data');
    }
  }
  
  next();
};

export default maxAuthMiddleware;