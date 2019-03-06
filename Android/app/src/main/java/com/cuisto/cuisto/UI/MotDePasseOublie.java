package com.cuisto.cuisto.UI;

import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.cuisto.cuisto.API.Model.User;
import com.cuisto.cuisto.API.Service.UserClient;
import com.cuisto.cuisto.API.Service.ServiceGenerator;
import com.cuisto.cuisto.R;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MotDePasseOublie extends AppCompatActivity {

    private EditText Et_UserEmail;
    private Button Btn_Connexion;

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        requestWindowFeature(Window.FEATURE_NO_TITLE);//will hide the title.
        getSupportActionBar().hide(); //hide the title bar.

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mot_de_passe_oublie);
        Et_UserEmail = findViewById(R.id.Et_UserEmail);
        Btn_Connexion = findViewById(R.id.Btn_ConnexionPassword);
        Btn_Connexion.setTextColor(getResources().getColor(R.color.whiteMoreTransparent));

        Et_UserEmail.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if(Validation()){
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

    public void Envoie(View v){
        if(Validation()) {
            UserClient userClient = ServiceGenerator.retrofit.create(UserClient.class);
            Call<Void> call = userClient.forgotPassword(new User(Et_UserEmail.getText().toString()));

            call.enqueue(new Callback<Void>() {
                @Override
                public void onResponse(Call<Void> call, Response<Void> response) {
                    if (response.isSuccessful()) {

                        DialogOublie cdd = new DialogOublie(MotDePasseOublie.this);
                        cdd.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
                        cdd.setCanceledOnTouchOutside(false);
                        cdd.show();

                    } else {
                        switch (response.code()) {
                            case 404:
                                Toast.makeText(MotDePasseOublie.this, "Error 404", Toast.LENGTH_SHORT).show();
                                break;
                            case 401:
                                Toast.makeText(MotDePasseOublie.this, "Informatin invalide", Toast.LENGTH_SHORT).show();
                                break;
                            default:
                                Toast.makeText(MotDePasseOublie.this, String.valueOf(response.code()), Toast.LENGTH_SHORT).show();
                                break;
                        }
                    }
                }

                @Override
                public void onFailure(Call<Void> call, Throwable t) {
                    Toast.makeText(MotDePasseOublie.this, "Fail", Toast.LENGTH_SHORT).show();
                }
            });
        }


    }
    public void Annuler(View v){
        finish();
    }

    @Override
    public void finish() {
        super.finish();
        overridePendingTransition(R.anim.slide_in_left, R.anim.slide_out_right);
    }

    public boolean Validation(){
        return (Et_UserEmail.getText().length() != 0);
    }
}
