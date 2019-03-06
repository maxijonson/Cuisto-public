package com.cuisto.cuisto.API.Service;

import com.cuisto.cuisto.API.Model.Items;
import com.cuisto.cuisto.API.Model.*;


import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ItemClient {

    @GET("item/liste")
    Call<Items> getItems(@Header("x-auth") String auth, @Query("typeItem") String typeItem);

    @GET("item/Types")
    Call<Types> getTypes(@Header("x-auth") String auth);

    @GET("item/{id}")
    Call<Item> getDescriptionItem(@Header("x-auth") String auth, @Path("id") int id);

}
