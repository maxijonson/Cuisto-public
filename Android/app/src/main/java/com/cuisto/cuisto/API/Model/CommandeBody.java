package com.cuisto.cuisto.API.Model;

public class CommandeBody {

    String statut = "En cours";
    Integer[] items;
    Integer client;

    public CommandeBody(Integer[] items, Integer client) {
        this.items = items;
        this.client = client;
    }
}
