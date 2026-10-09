# QuickNotes System Architecture

## 1. Overview

QuickNotes is a web application that allows users to retrieve, create, update, and delete notes. The frontend communicates with a backend through a REST API, and the backend stores data in a relational database.

The current project is a frontend demonstration using JSONPlaceholder. This document describes a proposed production architecture with persistent storage, authentication, and scalable infrastructure.

## 2. Functional Requirements

The system should allow users to:

1. Retrieve a list of notes.
2. View an individual note.
3. Create a note with a title and optional body.
4. Update an existing note.
5. Delete a note.
6. Access only the notes they are authorized to view.
7. Receive clear feedback when an operation succeeds or fails.

## 3. Non-Functional Requirements

- **Performance:** Common API requests should respond quickly under normal traffic.
- **Availability:** The application should remain available when an individual application server fails.
- **Scalability:** Additional application servers should be added as demand increases.
- **Security:** Authentication, authorization, HTTPS, input validation, and secure secret management should protect users and their data.
- **Reliability:** Database backups and tested recovery procedures should reduce data-loss risk.
- **Maintainability:** The system should use clear component boundaries, monitoring, logs, and automated tests.

## 4. High-Level Architecture

```text
                    USERS
                      |
                      v
               DNS / HTTPS
                      |
                      v
                CDN / WAF
                      |
                      v
               LOAD BALANCER
                 /        \
                v          v
          APP SERVER 1  APP SERVER 2
                \          /
                 v        v
              REST API SERVICE
                 /       \
                v         v
             CACHE     MESSAGE QUEUE
                |            |
                v            v
          PRIMARY DATABASE  BACKGROUND
                |           WORKERS
                v
          READ REPLICA
```

This is a logical architecture. The load balancer distributes incoming requests between application servers. The application servers validate requests, enforce access permissions, and communicate with the cache, database, or background processing system as needed.

## 5. Component Responsibilities

### Client

The browser displays the notes interface and sends requests using JavaScript's Fetch API. It displays loading, success, and error messages.

### DNS and HTTPS

DNS resolves the application's domain name. HTTPS encrypts communication between the client and the service.

### CDN and Web Application Firewall

A content delivery network (CDN) can cache static assets such as CSS, JavaScript, and images closer to users. A web application firewall (WAF) can help filter malicious traffic.

Private note data should not be publicly cached. Personalized responses require appropriate cache controls.

### Load Balancer

The load balancer distributes requests across healthy application servers. Health checks help it stop routing requests to failed instances.

### Application Servers and REST API

Multiple application server instances handle requests. The API validates data, authenticates users, checks authorization, and performs note operations.

Keeping application servers stateless makes it easier to add or replace instances.

### Cache

A cache such as Redis can store frequently accessed data and reduce repeated database queries. Cached note data must be invalidated or updated when the underlying notes change.

### Primary Database and Read Replica

A relational database such as PostgreSQL stores users, notes, and tags. The primary database handles writes. A read replica can serve suitable read queries and reduce read pressure on the primary.

Replication may be delayed, so some reads requiring the latest write should use the primary database.

### Message Queue and Background Workers

A message queue can hold non-urgent tasks such as sending notifications or processing exports. Background workers process these tasks independently of the main request.

Core note creation should be confirmed only after the database has successfully saved the note.

### Monitoring and Backups

Centralized logs, metrics, alerts, regular backups, and tested restore procedures help detect failures and recover from incidents. A production deployment should monitor API latency, error rates, database health, and queue depth.

## 6. Traffic and Capacity Estimates

The following figures are planning assumptions, not measured production traffic.

Assumptions:

- Registered users: 1,000,000.
- Daily active users: 10% of registered users.
- Each daily active user makes 20 note-read requests per day.
- Each daily active user creates 1 note per day.
- Average stored note size, including metadata: 10 KB.
- Peak traffic is estimated at five times average traffic.

### Daily active users

1,000,000 × 10% = **100,000 daily active users**.

### Read requests

100,000 users × 20 reads = **2,000,000 read requests per day**.

Average read rate:

2,000,000 ÷ 86,400 ≈ **23.15 reads per second**.

Estimated peak read rate:

23.15 × 5 ≈ **116 reads per second**.

### Write requests

100,000 users × 1 note = **100,000 note creations per day**.

Average write rate:

100,000 ÷ 86,400 ≈ **1.16 writes per second**.

Estimated peak write rate:

1.16 × 5 ≈ **5.79 writes per second**.

These calculations estimate note reads and creations only. They exclude updates, deletes, authentication, background jobs, and other API requests.

### Annual storage growth

100,000 notes per day × 10 KB per note = 1,000,000 KB per day.

Using decimal units, this is approximately 1 GB per day.

1 GB × 365 days = **approximately 365 GB of new note data per year**.

This estimate excludes database indexes, backups, replication overhead, logs, and infrastructure overhead. Actual storage requirements depend on real note sizes and usage.

## 7. Example Request Flows

### Flow A: Retrieve notes

1. The user opens QuickNotes and requests their notes.
2. The browser sends a `GET /api/notes` request over HTTPS.
3. The load balancer forwards the request to a healthy application server.
4. The API authenticates the user and checks which notes they can access.
5. The service checks the cache for an eligible response.
6. If the data is not cached, the service queries the database.
7. The API returns the authorized notes as JSON with `200 OK`.
8. The browser renders the notes and displays a success message.

### Flow B: Create a note

1. The user enters a title and optional body.
2. The browser validates basic input and sends a `POST /api/notes` request.
3. The load balancer routes the request to an application server.
4. The API authenticates the user, checks permissions, and validates the request.
5. The application saves the note in a database transaction.
6. After a successful save, the API returns the created note with `201 Created`.
7. The service invalidates or updates relevant cached data.
8. The browser displays the new note and confirms that creation succeeded.

If the database save fails, the API should return an appropriate error instead of claiming that the note was created.

## 8. Scaling Strategy

### Horizontal application scaling

Add more application server instances behind the load balancer as request volume grows. Stateless servers allow requests to be distributed without relying on one particular server.

### Database optimization

Add indexes for commonly filtered columns, optimize slow queries, and use connection pooling. A read replica can serve suitable read-heavy workloads.

### Caching

Cache appropriate frequently accessed data to reduce database load. Private user data must never be served across users due to incorrect cache keys or permissions.

### Background processing

Move non-essential, time-consuming work to background workers. Scale the worker pool when the queue grows.

### Static asset delivery

Use a CDN for static frontend files to reduce latency and application server traffic.

## 9. Trade-Offs

### SQL database vs. NoSQL database

A relational database provides strong support for structured data, relationships, constraints, and transactions. This suits the relationships between users, notes, and tags.

A NoSQL database may provide more flexible document structures, but would require different choices for enforcing relationships and querying related data.

**Decision:** Use a relational database such as PostgreSQL for the proposed system.

### Cache vs. direct database reads

Caching reduces database load and can improve response times. However, it introduces invalidation complexity and can return stale data.

**Decision:** Cache selected read operations and invalidate affected entries after successful writes.

### Read replicas vs. a single database

Read replicas can improve read capacity, but replication lag may cause a recent update to be temporarily absent from replica results.

**Decision:** Use replicas for suitable read-heavy requests and use the primary for operations that require the latest committed data.

### Synchronous vs. asynchronous work

Synchronous work is easier to reason about, but slow secondary tasks can delay API responses. Asynchronous processing improves responsiveness but introduces queue management and retry complexity.

**Decision:** Keep core note persistence synchronous, while processing suitable secondary tasks asynchronously.

## 10. Avoiding Single Points of Failure

- Run at least two application server instances behind a health-checking load balancer.
- Deploy critical infrastructure across multiple availability zones where supported.
- Use database replication and automated backups, with documented recovery procedures.
- Configure appropriate queue durability and worker retry policies.
- Monitor the health of the cache and avoid making it the only copy of important data.
- Use alerts for elevated errors, slow responses, database failures, and growing queue backlogs.
- Test failover and restoration procedures rather than assuming that backups will work.

A multi-instance architecture reduces individual failure risks but does not guarantee uninterrupted availability. The database, networking, and other shared dependencies also require appropriate redundancy and recovery planning.

## 11. Conclusion

The proposed architecture separates the browser, API service, data storage, and background processing. It supports horizontal application scaling, efficient reads, persistent storage, and safer failure recovery. The architecture can evolve as real traffic and operational requirements become clearer.