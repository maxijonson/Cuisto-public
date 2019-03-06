package com.cuisto.cuisto.API.Model;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

public class Salle {
    @SerializedName("id")
    @Expose
    private Integer id;
    @SerializedName("nom")
    @Expose
    private String nom;
    @SerializedName("actif")
    @Expose
    private boolean actif;

    public Integer getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public boolean getActif() { return actif; }
}
