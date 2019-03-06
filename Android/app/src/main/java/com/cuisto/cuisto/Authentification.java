package com.cuisto.cuisto;

import android.app.Application;

import com.cuisto.cuisto.API.Model.User;

public class Authentification extends Application{
    private static String xauth;
    private static User utilisateur;

    public static void setUtilisateur(User user) {
        utilisateur = user;
    }

    public static User getUtilisateur() {
        return utilisateur;
    }

    public static String getXauth() {
        return xauth;
    }

    public static void setXauth(String auth) {
        xauth = auth;
    }

    public static void resetAuthentification(){
        xauth = null;
    }

    public static boolean isAuthentificate(){
        return (xauth != null);
    }
}
