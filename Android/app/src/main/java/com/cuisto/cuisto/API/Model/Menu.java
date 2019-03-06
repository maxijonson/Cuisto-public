package com.cuisto.cuisto.API.Model;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

public class Menu {
    @SerializedName("id")
    @Expose
    private Integer id;
    @SerializedName("nom")
    @Expose
    private String nom;
    @SerializedName("type")
    @Expose
    private String type;

    public Menu(Integer id, String nom, String type) {
        this.id = id;
        this.nom = nom;
        this.type = type;
    }

    public Integer getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public String getType() {
        return type;
    }
}
