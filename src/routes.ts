import { Application } from 'express';

// Central place to register Express routes. Currently there are none but the
// function keeps the setupServer file clean when routes are added.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (app: Application) => {
    const routes = () => {};

    routes();
};
