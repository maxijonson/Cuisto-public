package com.cuisto.cuisto.UI;


import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.MenuItem;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.cuisto.cuisto.API.Model.User;
import com.cuisto.cuisto.API.Service.ServiceGenerator;
import com.cuisto.cuisto.Authentification;
import com.cuisto.cuisto.API.Service.UserClient;
import com.cuisto.cuisto.R;
import retrofit2.Call;
import retrofit2.Callback;

public class LoginActivity extends AppCompatActivity {



    public ServiceGenerator serviceGenerator
            = new ServiceGenerator(/* ADRESSE FELIX: */"http://cuisto.herokuapp.com/api/");
            //(/* ADRESSE FELIX: */"http://135.19.201.115:3000/api/");
    public User user;
    TextView Tv_Error;
    EditText editUsername;
    EditText editPassword;
    Button Btn_Connexion;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        requestWindowFeature(Window.FEATURE_NO_TITLE);//will hide the title.
        getSupportActionBar().hide(); //hide the title bar.
        // Hide status bar
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        // Show status bar
        //getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);


        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        Tv_Error = findViewById(R.id.Tv_Error);
        editUsername = (EditText) findViewById(R.id.editTextUsername);
        editPassword = (EditText) findViewById(R.id.editTextPassword);
        Btn_Connexion = (Button)findViewById(R.id.Btn_ConnexionLogin);
        Btn_Connexion.setTextColor(getResources().getColor(R.color.whiteMoreTransparent));


        editPassword.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if(validation()){
                 Btn_Connexion.setEnabled(true);
                 Btn_Connexion.setTextColor(getResources().getColor(R.color.white));
                }
                else {
                    Btn_Connexion.setEnabled(false);
                    Btn_Connexion.setTextColor(getResources().getColor(R.color.whiteMoreTransparent));
                }
            }

            @Override
            public void afterTextChanged(Editable s) {

            }
        });

        editUsername.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if(validation()){
                    Btn_Connexion.setEnabled(true);
                    Btn_Connexion.setTextColor(getResources().getColor(R.color.white));
                }
                else {
                    Btn_Connexion.setEnabled(false);
                    Btn_Connexion.setTextColor(getResources().getColor(R.color.whiteMoreTransparent));
                }
            }

            @Override
            public void afterTextChanged(Editable s) {

            }
        });
    }


    @Override
    public boolean onOptionsItemSelected(MenuItem item) {

        return super.onOptionsItemSelected(item);
    }

    private void SetAuth(String xauth){
        Authentification.setXauth(xauth);
    }

    private void SetUser(User user)
    {
        Authentification.setUtilisateur(user);
    }

    public void Connexion(View vue){

         editUsername = (EditText) findViewById(R.id.editTextUsername);
         editPassword = (EditText) findViewById(R.id.editTextPassword);

        user = new User(editUsername.getText().toString(), editPassword.getText().toString());

        executeLoginRequest(user);
    }

    private void mainActivityChange(){
        Intent intent = new Intent(this,MainActivity.class);
        startActivity(intent);
        finish();

    }

    private void executeLoginRequest (User user){
        UserClient client = serviceGenerator.retrofit.create(UserClient.class);
        Call<User> call = client.loginAccount(user);

        call.enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, retrofit2.Response<User> response) {

                if(response.isSuccessful())
                {
                    SetAuth(response.headers().get("x-auth"));
                    User testUser = response.body();
                    SetUser(testUser);
                    mainActivityChange();
                }
                else{
                    Tv_Error.setVisibility(View.VISIBLE);
                    switch (response.code()){
                        case 404:
                            //
                            // Toast.makeText(LoginActivity.this, "Error 404", Toast.LENGTH_SHORT).show();
                            break;
                        case 401:
                            //Toast.makeText(LoginActivity.this, "Informatin invalide", Toast.LENGTH_SHORT).show();
                            break;
                        default:
                            //Toast.makeText(LoginActivity.this, "ALLO", Toast.LENGTH_SHORT).show();
                            break;
                    }
                }
            }

            @Override
            public void onFailure(Call<User> call, Throwable t) {
                t.fillInStackTrace();
                Toast.makeText(LoginActivity.this, t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });

    }

    public void onForget(View v){
        startActivity(new Intent(this, MotDePasseOublie.class));
        overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left);

        //Toast.makeText(this, "Oublié", Toast.LENGTH_SHORT).show();
    }

    public boolean validation(){
        return (editUsername.getText().length() >0 && editPassword.getText().length() > 0);
    }
}


