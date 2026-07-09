import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "Vehicles endpoint working",
    vehicles: [],
  });
});

router.get("/:vehicleId", (req, res) => {
  res.json({
    message: "Single vehicle endpoint working",
    vehicleId: req.params.vehicleId,
  });
});

export default router;