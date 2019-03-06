package com.cuisto.cuisto.API.Service;

import com.cuisto.cuisto.API.Model.Tables;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;

public interface TableClient {


    @GET("Table/liste")
    Call<Tables> getListTable(@Header("x-auth") String auth);

}
