package com.cuisto.cuisto.API.Model;

public class Client {

    private Integer id;
    private Commandes commandes;
    private Table table;

    public Commandes getCommandes() {
        return commandes;
    }

    public Client(Integer id, Commandes commandes, Table table) {
        this.id = id;
        this.commandes = commandes;
        this.table = table;
    }
}
