implementation("org.springframework.boot:spring-boot-starter-data-jpa")
implementation("org.springframework.boot:spring-boot-starter-jdbc")

    spring-boot-starter-data-jpa:
        This dependency provides support for working with relational databases using Java Persistence API (JPA).
        It includes libraries for Hibernate, an Object-Relational Mapping (ORM) framework, which simplifies the interaction between Java objects and a relational database.
        With JPA, you define entities as plain Java objects, annotate them to map them to database tables, and use repositories to perform CRUD (Create, Read, Update, Delete) operations.
        It's typically used when you want to work with higher-level abstractions like entities, repositories, and JPQL (Java Persistence Query Language) queries.

    spring-boot-starter-jdbc:
        This dependency provides support for working with relational databases using JDBC (Java Database Connectivity).
        JDBC is a lower-level API compared to JPA. It allows you to execute SQL queries directly against the database and handle connections, statements, result sets, etc., programmatically.
        It's more suitable when you need fine-grained control over SQL queries or when working with legacy databases that don't follow JPA conventions.
        Unlike JPA, you work with SQL queries directly instead of using entity classes and repositories.

In summary, spring-boot-starter-data-jpa is higher-level and provides more abstraction over database interactions
through JPA, while spring-boot-starter-jdbc is lower-level and offers direct access to the JDBC API for executing SQL
queries. The choice between them depends on the requirements of your application and your preference for working with
ORM frameworks like Hibernate or with raw SQL queries.
