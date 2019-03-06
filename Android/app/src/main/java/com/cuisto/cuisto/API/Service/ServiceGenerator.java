package com.cuisto.cuisto.API.Service;

import android.content.Context;
import android.os.AsyncTask;
import android.support.v7.app.AppCompatActivity;
import android.widget.Toast;

import com.cuisto.cuisto.API.Model.User;
import com.cuisto.cuisto.API.Service.ApiCallback;
import com.cuisto.cuisto.API.Service.UserClient;
import com.cuisto.cuisto.Authentification;
import com.cuisto.cuisto.UI.LoginActivity;


import java.util.concurrent.ExecutionException;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ServiceGenerator {
    static boolean retourLogin;
    public static String BASE_URL = "http://172.22.164.229:3000/api/";

    public static Retrofit.Builder builder;
    public static  Retrofit retrofit;
    Authentification auth;

    public ServiceGenerator(String url) {
        BASE_URL = url;
        builder = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create());
        retrofit = builder.build();

    }

    public ServiceGenerator() {
        builder = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create());
        retrofit = builder.build();
    }


    public static boolean login(User user){
        UserClient client = retrofit.create(UserClient.class);
        Call<User> call = client.loginAccount(user);



        call.enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                if(response.isSuccessful())
                {
                    retourLogin = true;
                }
                else {
                    retourLogin = false;
                }
            }

            @Override
            public void onFailure(Call<User> call, Throwable t) {
                retourLogin = false;
            }
        });
        return retourLogin;
    }

    public class loginThread extends AsyncTask<Void, Integer, Boolean>{
        public boolean succes;
        User userVar;
        public loginThread(User user){
            super();
            userVar = user;
        }

        @Override
        protected Boolean doInBackground(Void... voids) {
            UserClient client = retrofit.create(UserClient.class);
            Call<User> call = client.loginAccount(userVar);

            call.enqueue(new Callback<User>() {
                @Override
                public void onResponse(Call<User> call, Response<User> response) {
                    if(response.isSuccessful()) {
                        Authentification.setXauth(response.headers().get("x-auth"));
                        Authentification.setUtilisateur(response.body());
                    }
                    else {
                        switch (response.code()){
                            case 404:
                                break;
                            case 401:
                                break;
                            default:
                                break;
                        }
                    }
                    succes =response.isSuccessful();
                }

                @Override
                public void onFailure(Call<User> call, Throwable t) {
                    succes = false;
                }
            });
            return null;
        }

        @Override
        protected void onPostExecute(Boolean aBoolean) {
            super.onPostExecute(aBoolean);
        }

        public boolean getSucces(){
            return succes;
        }
    }










}
