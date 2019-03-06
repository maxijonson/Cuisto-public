package com.cuisto.cuisto.API.Model;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.util.List;

public class Commande {

    @SerializedName("id")
    @Expose
    private Integer id;

    @SerializedName("statut")
    @Expose
    private String statut;

    @SerializedName("client")
    @Expose
    private Integer client;

    @SerializedName("Employe")
    @Expose
    private Employe employe;

    @SerializedName("Table")
    @Expose
    private Table table;

    @SerializedName("Items")
    @Expose
    private List<Item> items;

    public Commande(String statut, List<Item> items, int client, Table table) {
        this.statut = statut;
        this.items = items;
        this.client = client;
        this.table = table;
    }
    public Commande(int id,String statut, List<Item> items, int client, int tableId) {
        this.id = id;
        this.statut = statut;
        this.items = items;
        this.client = client;
        //this.tableId = tableId;
    }

    public Commande(int id, String statut, List<Item> items, int client, Employe employe, Table table) {
        this.id = id;
        this.statut = statut;
        this.items = items;
        this.client = client;
        this.employe = employe;
        this.table = table;
    }

    public Commande(String statut) {
        this.statut = statut;
    }

    public Integer getId() {
        return id;
    }

    public String getStatut() {
        return statut;
    }

    public List<Item> getItems() {
        return items;
    }

    public Integer getClient() {
        return client;
    }

    public Employe getEmploye() {
        return employe;
    }

    public Table getTable() {
        return table;
    }




}
