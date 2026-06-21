---
layout: layouts/post.njk
title: "Getting K-scale's zeroth bot to T-pose"
date: 2025-01-01
author: "Yoyo"
category: lab
---

*by: Fred, Homero, Stanley, Yoyo • 2025-01-19*

I briefly visited K-scale labs with Verda, and then, two-day hackathon! 🎉 Wow, humanoids are difficult to handle with joint and actuators issues.
We wanted to tackle the dance pose challenge, planning trajectories from one pose to another. But, too many bugs! So we threw a hail Mary and just recorded the transitions from one pose (e.g. A-Pose) to another (e.g. T-Pose). Connect to robot, program fixed points, figure out centre of mass and bounds while playing back pose trajectories.

We used tensorflow js + corresponded the transition with robotic arm movement with the help of flask and other python scripts.
[Repo](https://github.com/HomeroRR/khacks_dancing_robot
[Demo](https://youtu.be/nen0Na_uitc?si=3nQLfMDK63MiQjNe)
)