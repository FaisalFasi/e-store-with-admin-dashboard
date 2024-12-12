import express from "express";
import { saveAddress } from "../controllers/address.controller.js";

const router = express.Router();

router.get("/", saveAddress);

export default router;
