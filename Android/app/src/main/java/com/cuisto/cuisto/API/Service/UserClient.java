package com.cuisto.cuisto.API.Service;


import com.cuisto.cuisto.API.Model.User;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;

public interface UserClient {

    void onResponse(Boolean success);

    @POST("signin")
    Call<User> loginAccount(@Body User user);

    @GET("logout")
    Call<Void> logoutAccount(@Header("x-auth") String auth);

    @POST("forgot")
    Call<Void> forgotPassword(@Body User user);


}

