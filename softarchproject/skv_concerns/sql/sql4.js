node-oracledb version 1.13
About node-oracledb

The node-oracledb add-on for Node.js powers high performance Oracle Database applications.

Use node-oracledb to connect Node.js 4, 6 and 7 to Oracle Database.

The add-on is stable, well documented, and has a comprehensive test suite.

The node-oracledb project is open source and maintained by Oracle Corp. The home page is on the Oracle Technology Network.
Node-oracledb supports:

    Promises, Callbacks and Streams
    SQL and PL/SQL execution
    REF CURSORs
    Large Objects: CLOBs and BLOBs as Streams or Strings and Buffers
    Oracle Database 12c JSON datatype
    Query results as JavaScript objects or arrays
    Smart mapping between JavaScript and Oracle types with manual override available
    Data binding using JavaScript types, objects or arrays
    Transaction Management
    Inbuilt Connection Pool with Queueing, Aliasing and Liveness checking
    Database Resident Connection Pooling (DRCP)
    External Authentication
    Row Prefetching
    Statement Caching
    Client Result Caching
    End-to-end Tracing, Mid-tier Authentication, and Auditing
    Oracle High Availability Features
        Fast Application Notification (FAN)
        Runtime Load Balancing (RLB)
        Transparent Application Failover (TAF)

We are actively working on supporting the best Oracle Database features, and on functionality requests from users involved in the project.
Installation

Prerequisites:

    Python 2.7

    C Compiler with support for C++ 11 (Xcode, gcc, Visual Studio or similar)

    Oracle 11.2, 12.1 or 12.2 client libraries. Use the small, free Oracle Instant Client "basic" and "SDK" packages if your database is remote. Or use the libraries and headers from a locally installed database such as the free Oracle XE release.

    Oracle's standard client-server network compatibility applies: Oracle Client 12.2 can connect to Oracle Database 11.2 or greater. Oracle Client 12.1 can connect to Oracle Database 10.2 or greater. Oracle Client 11.2 can connect to Oracle Database 9.2 or greater.

    Set OCI_LIB_DIR and OCI_INC_DIR during installation if the Oracle libraries and headers are in a non-default location

Run npm install oracledb to install from the npm registry.

See INSTALL for details.
Examples

See the examples directory. Start with examples/select1.js.
Documentation

See Documentation for the Oracle Database Node.js Add-on.