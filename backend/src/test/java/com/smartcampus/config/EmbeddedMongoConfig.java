package com.smartcampus.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import de.flapdoodle.embed.mongo.commands.ServerAddress;
import de.flapdoodle.embed.mongo.distribution.Version;
import de.flapdoodle.embed.mongo.transitions.Mongod;
import de.flapdoodle.embed.mongo.transitions.RunningMongodProcess;
import de.flapdoodle.reverse.TransitionWalker;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

/**
 * Manual Embedded MongoDB configuration for Spring Boot 3.2+
 */
@TestConfiguration
@ConditionalOnProperty(name = "spring.mongodb.embedded.enabled", havingValue = "true", matchIfMissing = true)
public class EmbeddedMongoConfig {

    private TransitionWalker.ReachedState<RunningMongodProcess> running;

    @Bean
    @Primary
    public MongoClient mongoClient() {
        if (running == null) {
            startMongo();
        }
        ServerAddress address = running.current().getServerAddress();
        return MongoClients.create(String.format("mongodb://%s:%d", address.getHost(), address.getPort()));
    }

    private void startMongo() {
        running = Mongod.instance().start(Version.Main.V6_0);
    }

    @PreDestroy
    public void stopMongo() {
        if (running != null) {
            running.close();
        }
    }
}
