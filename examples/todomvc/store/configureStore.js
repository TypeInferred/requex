import rootReducer from '../reducers';

export default function configureStore() {
  const store = rootReducer.build().toStore();

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').build();
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
