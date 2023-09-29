---
theme: css/synadia.css
---

<!-- slide bg="./images/Aurora-5k.jpg" -->
<grid drag="100 75" drop="topleft" >
## Rethinking Connectivity<br> at the Edge
Scaling fleets of low-powered devices using NATS.io
</grid>

<grid drag="100 50" drop="bottomleft" >
<split gap="1">
![Image|100](https://avatars.githubusercontent.com/u/178316?v=4) <!-- element class="bio" style="align-self:flex-end;" -->
::: block
Jeremy Saenz <!-- element style="padding-top:0.5rem;" -->
<br>
Senior Software Engineer at Synadia
:::
</split>
</grid>

---

## Before we begin...
{Add link to survey app here}

---

## About Me

---

##### About Me

::: block
<split gap="1">
![Image|80](https://avatars.githubusercontent.com/u/178316?v=4) <!-- element class="bio" style="align-self:flex-end;" -->

### Jeremy Saenz <!-- element style="padding-top:1.75rem;" -->

</split>
:::

- Long time Gopher (@thecodegangsta)
- Author of **Martini**, **CLI**, **Negroni**, and more...
- Working **@synadia** on **NATS**
- Moved from Engineer -> Product and back again

---

---

# 🙏 Pray to the Demo Gods

---

## Rethinking Connectivity

---

##### Rethinking Connectivity

## Why Rethink Connectivity?

**Multi-cloud** and **Edge** computing is driving a massive transformation

---

##### Rethinking Connectivity

## Limitations of Today's Technology

- **DNS/hostnames/IP** based discovery
- **Pull based** request/reply semantics
- **Perimeter based** security
- **Location-dependent** backends
- Many layers built on **HTTP 1:1** communication

---

##### Rethinking Connectivity

## Introducing NATS

---

##### Rethinking Connectivity

## Introducing NATS

NATS is an **open source**, **high performance** messaging system and **connective fabric**.

It aims to **simplify** the number of technologies you use for your services to communicate, while also **empowering** you to build systems that are **globally available**, **multi-cloud**, **multi-geo**, and **highly adaptive** to change and scale.

---

##### Rethinking Connectivity

# Introducing NATS

- Location-independent addressing
- M:N communications
- Push and pull based
- Decentralized and secure multi-tenancy
- Intelligent persistence
- Global scale

---

##### Rethinking Connectivity

## NATS Architecture

- **Server:** simple, small, easy to deploy Go binary
- **Client:** 40+ client libraries in various languages

---

##### Rethinking Connectivity

## NATS Architecture

- **Core NATS** - High performance messaging. Temporal coupling.
- **JetStream** - Flexible, modern streaming and persistence. Temporal decoupling.

---

##### Rethinking Connectivity

## Core NATS

- Fire and forget message publishing
- Very fast - Scales to millions of msg/s on a single instance
- Flexible subject based addressing with wildcards
- Payload agnostic

---

##### Rethinking Connectivity

## Core NATS

- **Request** and **Reply**
- **Publish** and **Subscribe**
- **Fan In** and **Fan Out**
- **Load Balancing** via **Queue Groups**

---

##### Rethinking Connectivity
## NATS JetStream

---

##### Rethinking Connectivity
## What is JetStream?

JetStream is a next-gen persistence layer built on top of NATS Core that allows temporal decoupling between subscribers and publishers.

It is multi-tenant, highly configurable and globally scalable.

---

##### Rethinking Connectivity
## What is JetStream?

- **Secure** data streams with **multiple consumer models**
- **Multiple streaming patterns** supported
- **Digital twins**/**replicated data**
- **Mux** and **Demux** data
- **Materialized views:** key/value and object stores

---

##### Rethinking Connectivity
## NATS Demo

---

## NATS for Fleet Management

---

##### NATS For Fleet Management
## What's a Fleet?

+ Large number of distributed devices
+ Broad variance in hardware profiles
    - Microcontrollers, SBCs, Mobile devices, PCs
+ Unreliable network connectivity
+ Perimeterless security

---

##### NATS For Fleet Management
## 4 Fleet Management Patterns
+ Live Querying
+ Configuration Management
+ Remote Commands
+ Store and Forward

---

##### 4 Fleet Management Patterns
## Live Querying

<split left="3">

- Real-time information for every device online.
- Select, filter, group.
- Direct answers from the devices.

![[live-query.excalidraw|500]]

<split>

---

##### 4 Fleet Management Patterns
## Configuration Management

<split left="3">

- Push configuration updates to groups of devices.
- Must be available when devices are offline.
- Devices watch for changes in real-time.

![[config-management.excalidraw|500]]

<split>
    
---

##### 4 Fleet Management Patterns
## Remote Commands

<split left="3">

- Execute commands on one or more of devices.
- Enqueue commands for offline devices to catch up when connected.
- Evict commands that are no-longer relevant.

![[remote-commands.excalidraw|500]]

<split>

---

##### 4 Fleet Management Patterns
## Store and Forward

<split left="3">

- Devices can store data while being offline.
- Data is synchronized automatically when back online.
- Application logic does not change between states.

![[store-and-forward.excalidraw|500]]

<split>

---

##### 4 Fleet Management Patterns
# Let's try some of these out!

---

# Thank you!
- TODO: Add feedback and more info on Synadia

---

---

---
