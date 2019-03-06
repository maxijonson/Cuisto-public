package com.cuisto.cuisto.API.Model;


public class User {
    private Integer id;
    private String nom;
    private String prenom;
    private String telephone;
    private String courriel;
    private String tauxHoraire;
    private String username;
    private String password;
    private boolean admin;


    public User(String username, String password)
    {
        this.username = username;
        this.password = password;
    }

    public User(String username) {
        this.username = username;
    }

    public Integer getId(){
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPrenom() {
        return prenom;
    }
}


