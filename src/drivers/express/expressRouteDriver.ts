import { Router, Request } from "express";
import * as userHandlerFunctions from "../../user-module/Business-Logic";
import * as serviceHandler from "../../service-module/Business-logic/serviceHandler";
import * as buildingHandler from "../../building-module/business-logic/buildingHandler";
import * as logHandler from '../../logs-module/handlers/LogsHandler';
import { Response } from "express-serve-static-core";
import { loginRequest, User } from "../../shared/entity";
const version = require("../../../package.json").version;

export class ExpressRouteDriver {
  public static buildRoutes() {
    const router: Router = Router();

    /**
     * initialize welcome route
     */
    router.get("/", async (req, res) => {
      res.json({ version, message: "Welcome to the Lockbox API " + version });
    });
    console.log("building routes");

    /**
     * initialize public routes
     */
    this.initUserRoutes(router);
    this.initAccessLogRoutes(router);
    this.initServiceRequestRoutes(router);
    this.initBuildingRoutes(router);
    return router;
  }
  private static initUserRoutes(router: Router) {
    //get all users
    router.get("/users", async (req, res) => {
      const role = req.query.role;
      const payload = await userHandlerFunctions.fetchUsers({role});
      res.send(payload);
    });
    //search all users, add query filters, text searching etc...
    router.get("/users/search", async (req, res) => {
      res.send("search users route");
    });

    router.get("/users/dashboard");

    /**
     * Fetching a users rommates based on the student's id.
     */
    router.get("/users/:id/roommates", fetchRoommates);
    router.get("/users/:id", findUser);
    //add a user ( register )
    router.post("/users", createUserAccount);
    router.get("/users/login", login);
    /**
     * update user account with new status or.. whatever
     */
    router.patch("/users/:id", async (req, res) => {
      res.send("update a single user account");
    });

    router.get("/users/:id/guests", fetchGuests);
    router.get("/users/dashboard");
  }
  private static initAccessLogRoutes(router: Router) {
    /**
     * fetch all access logs, sort by date...
     */
    router.get("/logs", fetchAllLogs);
    /**
     * fetch single access log
     */
    router.get("/logs/:id", async (req, res) => {
      res.send("Fetch one access log");
    });
    /**
     * fetch and download archived routes. add query params to allow downloading bundles.
     */
    router.get("/logs/bundle", async (req, res) => {
      res.send("download archives..");
    });
    /**
     * post a new access log, flip granted or not granted flag.
     * 
     * @use for the script that will populate access log to show real time updates. 
     */
    router.post("/logs", async (req, res) => {
      res.send("post a new access log");
    });
  }

  private static initServiceRequestRoutes(router: Router) {
    router.get("/service/:id", fetchServiceRequests);

    router.patch("/service/:id", updateServiceRequest);
  }

  private static initBuildingRoutes(router: Router) {
    router.get("/buildings", fetchAllBuildings);

    router.get("/buildings/:id", fetchBuilding);

    router.get("/buildings/:id/logs", fetchBuildingLogs);
  }
}

/**
 *
 * User crud operations. refactor to module if time permits.
 *
 */

async function createUserAccount(req: Request, res: Response) {
  try {
    const user = req.body.user;
    const accountType = req.body.accountType;
    const accessRights = req.body.accessRights;
    await userHandlerFunctions.createUserAccount({ user, accountType });
    res.sendStatus(200).json();
  } catch (err) {
    res.sendStatus(404);
  }
}

async function findUser(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const user = await userHandlerFunctions.findUser({ id });
    res.status(200).send(user);
  } catch (err) {
    res.sendStatus(404);
  }
}

async function login(req: Request, res: Response) {
  try {
    const loginRequest: loginRequest = { ...req.body };
    const user = await userHandlerFunctions.login({ loginRequest });
    res.status(200).send(user);
  } catch (err) {
    res.status(404);
  }
}

async function fetchRoommates(req: Request, res: Response) {
  try {
    const studentId = req.params.id;

    const roommates: User[] = await userHandlerFunctions.loadStudentRoommates({
      id: studentId
    });
    res.status(200).send(roommates);
  } catch (err) {
    res.status(404);
  }
}

async function fetchGuests(req: Request, res: Response) {
  try {
    const hostId = req.params.id;
    const guests = await userHandlerFunctions.findGuests({ id: hostId });
  } catch (err) {
    res.status(404);
  }
}

async function deleteGuest(req: Request, res: Response) {
  try {
    const guestId = req.params.id;

    // await userHandlerFunctions.deleteGuests({ id: guestId });
    // res.status(200);
  } catch (err) {
    res.status(404);
  }
}

/**
 * service request crud operations...
 *
 */

async function fetchServiceRequests(req: Request, res: Response) {
  try {
    const requester = req.params.id;

    const serviceRequests = await serviceHandler.findUserServiceRequests({
      requester
    });
    res.status(200).send(serviceRequests);
  } catch (err) {
    res.status(404);
  }
}

async function updateServiceRequest(req: Request, res: Response) {
  try {
    const requestId: string = req.params.id;
    const update: serviceHandler.TicketResponse = req.body.response;
    await serviceHandler.updateServiceRequest({ requestId, response: update });
  } catch (err) {
    res.status(404);
  }
}

/**
 * Building crud operations
 *
 */

async function fetchAllBuildings(req: Request, res: Response) {
  try {
    const buildings = await buildingHandler.fetchAllBuildings();
    res.status(200).send(buildings);
  } catch (err) {
    res.status(400);
  }
}

async function fetchBuilding(req: Request, res: Response) {
  try {
    const buildingId = req.params.id;
    const building = await buildingHandler.fetchBuildingById({
      luid: buildingId
    });
    res.status(200).send(building);
  } catch (err) {
    res.status(400);
  }
}

async function fetchBuildingLogs(req: Request, res: Response) {
  try {
    const buildingId = req.params.id;
    const accessLogs = await buildingHandler.fetchBuildingLogsById({
      luid: buildingId
    });
    res.status(200).send(accessLogs);
  } catch (err) {
    res.status(400);
  }
}

async function fetchAllLogs(req:Request, res: Response){
  try{
    const accessLogs = await logHandler.fetchAccessLogs();
    res.status(200).send(accessLogs);
  }catch(err){
    res.status(404);
  }
}
