import { Router } from "express";

const route = Router();

route.get("/", (req, res) => {
  res.send("Events endpoint");
});

route.get("/:id", (req, res) => {
  res.send("Events endpoint");
});

route.post("/", (req, res) => {
  res.send("Events endpoint");
});

route.post("/:id",(req,res)=>{});

route.put("/:id/activate",(req,res)=>{});

export default route;