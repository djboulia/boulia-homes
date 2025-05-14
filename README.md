# Home Automation React App

Control the various devices across our houses

## to run the backend

```bash
npm run dev
```

Starts the backend server on localhost:8888 for testing. Use with the dev server in client_src for testing front end.

### to run the frontend

```bash
cd client_src
npm start
```

## Configuration files

In addition to `.env` files, there are two configuration files used to define the users and devices in the system.

### Environment files

- `.env` and `.env.dev` (development)

- these define the environment variables with credentials to login to the various providers that control the devices in the home

### Users

- located in `./testdb/user.json`

- contains the login information for each user

- lists which homes are associated with each user

### Homes

- located in `./testdb/home.json`

- defines a home. Each home has:

  - systems

    - these are the categoreis of systems in hte home such as thermostats, garage doors, etc.
    - each system has a list of devices, representing the invidiual devices in the system
      - each device has a list of attributes, including a `type` attribute that specifies the provider of the device
      - the provider is loaded and innitialized in the backend

  - zones

    - zones define areas wihin a home. These can be user defined, but usually indicate locations such as First Floor, Second Floor, Basement, Backyard, etc.
    - each zone has a list of devices, representing the invidiual devices in the zone

## Api Server

- This project uses a homegorwn API server to expose endpoints for the front end to use. Don't ask me why I thought this was a good idea. It seemed more relevant at the time, but there are much better solutions out there now.

  - Under the covers the API server uses the `express` library.

  - The Api server expects a series of `models` which are used to define the main endpoints exposed in the API server. The models are defined in the `./server/models` directory.

  - The models in turn initialize the providers that are used to control the devices in the home. The providers are defined in the `./server/iot` directory.

## Providers and Devices

- The `./server/iot` directory provides an abstraction layer for the various systems that control the devices in the home. So instead of directly accessing a provider (for instance, Nest), you would instead use the `thermostat` system.

  - The abstraction layer initializes the underlying provider (e.g. Nest) and which is then handed to the `thermostat` provider to control the device.

    - The idea is to provide a high level interface (e.g. raise temp, lower temp, lock door, unlock door) so that the front end can use the same interface to control the devices regardless of the provider.

- The `./server/iot/lib` directory contains the interface to access the various providers that are used to control the devices.

- The `./server/devices.js` module initializes the providers.
