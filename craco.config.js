module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Webpack dev server deprecation warnings'ı düzelt
      if (webpackConfig.devServer) {
        // Eski deprecated API'leri kaldır
        delete webpackConfig.devServer.onAfterSetupMiddleware;
        delete webpackConfig.devServer.onBeforeSetupMiddleware;
      }
      return webpackConfig;
    },
  },
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      // Yeni setupMiddlewares API'sini kullan
      // react-scripts'in middleware'lerini koru
      return middlewares;
    },
  },
};

