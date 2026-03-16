package com.yuvidu.booking_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

@SpringBootApplication
public class BookingServiceApplication extends AbstractMongoClientConfiguration {

	public static void main(String[] args) {
		SpringApplication.run(BookingServiceApplication.class, args);
	}

	@Override
	protected String getDatabaseName() {
		return "microservice";
	}

	@Override
	public com.mongodb.client.MongoClient mongoClient() {
		return com.mongodb.client.MongoClients.create("mongodb+srv://yuvidu:yuvidu@cluster1.kt7i4.mongodb.net/microservice?retryWrites=true&w=majority&appName=Cluster1");
	}

}
