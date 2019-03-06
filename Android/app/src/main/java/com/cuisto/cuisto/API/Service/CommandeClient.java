package com.cuisto.cuisto.API.Service;


import com.cuisto.cuisto.API.Model.*;


import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.PATCH;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface CommandeClient {

    @POST("Table/{id}/commande")
    Call<Void> PriseCommande(@Header("x-auth") String auth, @Path("id") int id, @Body CommandeBody body);

    @GET("commande/liste")
    Call<Commandes> ListeCommandes(@Header("x-auth") String auth, @Query("statut") String statut);

    @GET("commande/liste")
    Call<Commandes> ListeCommandes(@Header("x-auth") String auth, @Query("statut") String statut, @Query("client") int client);

    @GET("commande/liste")
    Call<Commandes> ListeCommandes(@Header("x-auth") String auth, @Query("client") int client);

    @GET("commande/liste")
    Call<Commandes> ListeCommandesTable(@Header("x-auth") String auth, @Query("Table_id") int Table_id);

    @PATCH("commande/{id}")
    Call<Commandes> PatchCommande(@Header("x-auth") String xauth,@Path("id") int id,  @Body Commande body);
}
