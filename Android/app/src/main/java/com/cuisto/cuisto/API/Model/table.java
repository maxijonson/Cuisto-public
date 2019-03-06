package com.cuisto.cuisto.API.Model;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

public class Table {
    @SerializedName("id")
    @Expose
    private Integer id;

    @SerializedName("maxPlace")
    @Expose
    private String maxPlace;
    @SerializedName("nom")
    @Expose
    private String nom;

    @SerializedName("Salle")
    @Expose
    private Salle Salle;

    public String getNom() {
        return nom;
    }

    public String getMaxPlace() {
        return maxPlace;
    }

    public Integer getId() {
        return id;
    }

    public Table(Integer id, String maxPlace, String nom) {
        this.id = id;
        this.maxPlace = maxPlace;
        this.nom = nom;
    }
    public Salle getSalle() {
        return Salle;
    }
}
