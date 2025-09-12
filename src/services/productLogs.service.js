exports.logEvent = async (productId, event) => {
    return await ProductLog.create({
      product: productId,
      user: req.user?._id,
      event,
      sessionId: req.sessionID,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  }