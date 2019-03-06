package com.cuisto.cuisto.UI;


import android.content.Intent;
import android.os.Parcel;
import android.os.Parcelable;
import android.os.PersistableBundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.design.widget.BottomNavigationView;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentTransaction;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.WindowManager;
import android.widget.Toast;

import com.cuisto.cuisto.API.Model.CommandeBody;
import com.cuisto.cuisto.API.Service.NotificationService;
import com.cuisto.cuisto.API.Service.ServiceGenerator;

import okhttp3.logging.HttpLoggingInterceptor;

import com.cuisto.cuisto.API.Service.UserClient;
import com.cuisto.cuisto.Authentification;
import com.cuisto.cuisto.R;
import com.cuisto.cuisto.UI.Commande.MainFragment.FragmentListeTable;

import java.io.Serializable;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends AppCompatActivity {
    BottomNavigationView menuBottom;
    private FragmentListeTable testFragment;
    private ItemListFragment itemListFragment;
    private CommandeEnCoursFragment commandeEnCoursFragment;
    private CommandePreteFragment commandePreteFragment;
    private Fragment curentFragment;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        getWindow().setStatusBarColor(ContextCompat.getColor(this, R.color.colorPrimaryDark));
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_main);
        menuBottom = findViewById(R.id.navigationView);
        menuBottom.setOnNavigationItemSelectedListener(navListener);

        testFragment = new FragmentListeTable();

        itemListFragment = new ItemListFragment();
        commandeEnCoursFragment = new CommandeEnCoursFragment();
        commandePreteFragment = new CommandePreteFragment();

        menuBottom.setSelectedItemId(R.id.navigation_prise_commande);

        //Notification Service
        startService(new Intent(this, NotificationService.class));
    }

    //Quand appuie sur un boutton du Menu en Haut
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()){
            //Boutton Envoyer
            case R.id.menu_deconnexion:
                executeLogout();
                return true;

        }

        return super.onOptionsItemSelected(item);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.menu_deconnexion, menu);
        return true;
    }


    private BottomNavigationView.OnNavigationItemSelectedListener navListener = new BottomNavigationView.OnNavigationItemSelectedListener() {
        @Override
        public boolean onNavigationItemSelected(@NonNull MenuItem menuItem) {
            switch (menuItem.getItemId()){
                case R.id.navigation_prise_commande:
                    setFragment(testFragment);
                    curentFragment = testFragment;
                    //Toast.makeText(MainActivity.this, "Prise de commande", Toast.LENGTH_SHORT).show();
                    return true;
                case R.id.navigation_menu:
                    setFragment(itemListFragment);
                    curentFragment = itemListFragment;
                    //Toast.makeText(MainActivity.this, "Menu", Toast.LENGTH_SHORT).show();
                    return true;
                case R.id.navigation_en_cours:
                    setFragment(commandeEnCoursFragment);
                    curentFragment = commandeEnCoursFragment;
                    //Toast.makeText(MainActivity.this, "Commande en cours", Toast.LENGTH_SHORT).show();
                    return true;
                case R.id.navigation_prete:
                    setFragment(commandePreteFragment);
                    curentFragment = commandePreteFragment;
                    //Toast.makeText(MainActivity.this, "Commande prête", Toast.LENGTH_SHORT).show();
                    return true;
            }
            return false;
        }
    };

    public void setFragment(Fragment fragment){
        FragmentTransaction fragmentTransaction = getSupportFragmentManager().beginTransaction();
        fragmentTransaction.replace(R.id.main_frame, fragment);
        fragmentTransaction.commit();
    }

    public void setFragmentDroite(Fragment fragment){
        FragmentTransaction fragmentTransaction = getSupportFragmentManager().beginTransaction();
        fragmentTransaction.replace(R.id.Fl_Liste_Commande, fragment);
        fragmentTransaction.commit();
    }

    public void removeFragmentDroite(Fragment fragment){
        if(fragment != null){

            FragmentTransaction fragmentTransaction = getSupportFragmentManager().beginTransaction();
            fragmentTransaction.remove(fragment).commit();
        }
    }

    public void Deconnexion(View vue){
        executeLogout();
    }

    private void executeLogout (){
        UserClient client = ServiceGenerator.retrofit.create(UserClient.class);
        Call<Void> call = client.logoutAccount(Authentification.getXauth());



        HttpLoggingInterceptor interceptor = new HttpLoggingInterceptor();
        interceptor.setLevel(HttpLoggingInterceptor.Level.BODY);

        call.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if(response.isSuccessful())
                {
                    loginChange();
                }
                else {
                    switch (response.code()){
                        case 404:
                            Toast.makeText(MainActivity.this, "Error 404", Toast.LENGTH_SHORT).show();
                            break;
                        case 401:
                            Toast.makeText(MainActivity.this, "Error 401", Toast.LENGTH_SHORT).show();
                            break;
                        default:
                            Toast.makeText(MainActivity.this, "WTF ERROR", Toast.LENGTH_SHORT).show();
                    }
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Toast.makeText(MainActivity.this, t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    //Pour retourner au login screen
    private void loginChange(){
        Intent intent = new Intent(this,LoginActivity.class);
        startActivity(intent);
        finish();
    }


    //Empecher le backbutton
    @Override
    public void onBackPressed() {
        //super.onBackPressed();
    }



    @Override
    protected void onResume() {
        super.onResume();
        menuBottom.setSelectedItemId(R.id.navigation_prise_commande);
    }



    //Changer le texte de l'action bar (acessible aux fragments)
    public void setActionBarTitle(String title) {
        getSupportActionBar().setTitle(title);
    }

}
