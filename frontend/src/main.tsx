import React from 'react';
import ReactDOM from 'react-dom/client';
import {createRootRoute, createRoute, createRouter, Link, Outlet, RouterProvider} from "@tanstack/react-router";
import {TanStackRouterDevtools} from "@tanstack/react-router-devtools";
import NavBar from "./components/nav/NavBar";
import ApplicationPage from "./components/application";
import AboutPage from "./components/about";

const rootRoute = createRootRoute({
    component: () => (
        <>
            <NavBar/>
            <Outlet />
            <TanStackRouterDevtools />
        </>
    ),
})

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: function Index() {
        return (
            <ApplicationPage/>
        )
    },
})

const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/about',
    component: function About() {
        return <AboutPage/>
    },
})

const routeTree = rootRoute.addChildren([indexRoute, aboutRoute])

const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
})


declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

const rootElement = document.getElementById('root');

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <RouterProvider router={router}/>
        </React.StrictMode>
    );
} else {
    console.error("Failed to find the root element. Ensure an element with id 'root' exists in your HTML.");
}