package com.cuisto.cuisto.API.Model;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

public class Item {
    @SerializedName("id")
    @Expose
    private Integer id;
    @SerializedName("nom")
    @Expose
    private String nom;
    @SerializedName("prix")
    @Expose
    private String prix;
    @SerializedName("description")
    @Expose
    private String description;
    @SerializedName("typeItem")
    @Expose
    private String typeItem;
    @SerializedName("Menu")
    @Expose
    private Menu Menu;

    public Item(Integer id, String nom, String prix, String description, String typeItem, Menu menu) {
        this.id = id;
        this.nom = nom;
        this.prix = prix;
        this.description = description;
        this.typeItem = typeItem;
        this.Menu = menu;
    }

    public Item(Integer id, String nom, String prix, String description, String typeItem) {
        this.id = id;
        this.nom = nom;
        this.prix = prix;
        this.description = description;
        this.typeItem = typeItem;
    }
    public Integer getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public String getPrix() {
        return prix;
    }

    public String getDescription() {
        return description;
    }

    public String getTypeItem() {
        return typeItem;
    }

    public com.cuisto.cuisto.API.Model.Menu getMenu() {
        return Menu;
    }
}
