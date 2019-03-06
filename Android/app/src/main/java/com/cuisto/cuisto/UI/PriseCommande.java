package com.cuisto.cuisto.UI;

import android.content.DialogInterface;
import android.content.Intent;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.WindowManager;
import android.widget.TextView;
import android.widget.Toast;

import com.cuisto.cuisto.API.Model.Adapters.ItemCommandeAdapter;
import com.cuisto.cuisto.API.Model.Adapters.TypeCommandeAdapter;
import com.cuisto.cuisto.API.Model.CommandeBody;
import com.cuisto.cuisto.API.Model.Item;
import com.cuisto.cuisto.API.Model.Items;
import com.cuisto.cuisto.API.Model.Types;
import com.cuisto.cuisto.API.Service.CommandeClient;
import com.cuisto.cuisto.API.Service.ItemClient;
import com.cuisto.cuisto.API.Service.ServiceGenerator;
import com.cuisto.cuisto.Authentification;
import com.cuisto.cuisto.R;

import java.util.ArrayList;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PriseCommande extends AppCompatActivity {


    private RecyclerView recyclerType;
    private RecyclerView recyclerItems;
    private RecyclerView recyclerCommande;
    private Items mItems = null;
    private Types mTypes = null;
    private Items data;
    private ItemCommandeAdapter adapterCommande;
    private int numClient;
    private int idTable;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        getWindow().setStatusBarColor(ContextCompat.getColor(this, R.color.colorPrimaryDark));

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_prise_commande);

        Intent intent = getIntent();
        numClient = intent.getIntExtra("NumClient",-1);
        idTable = intent.getIntExtra("idTable", -1);
        getSupportActionBar().setDisplayShowHomeEnabled(true);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setTitle("Prise de commande du client #"+ numClient);

        recyclerType = findViewById(R.id.rv_ListeTypesPriseCommande);

        loadTypes();

        data = new Items();
        data.items = new ArrayList<>();

    }
    //Quand appuie sur un boutton du Menu en Haut
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()){
            //Boutton Envoyer
            case R.id.action_send:
                //S'il y a au moins 1 item
                if(data.items.size() > 0){
                    //Le tableau d'id des objets pour la commande
                    Integer[] tableIdItem = new Integer[data.items.size()];
                    for(int i = 0; i < data.items.size();i++){
                        tableIdItem[i]=data.items.get(i).getId();
                    }
                    CommandeBody commandeBody = new CommandeBody(tableIdItem,numClient);
                    envoieCommande(commandeBody);
                    //Toast.makeText(this, "Envoie", Toast.LENGTH_SHORT).show();
                }
                else {
                    Toast.makeText(this, "Veuillez-choisir au moins un item  !", Toast.LENGTH_SHORT).show();
                }
                return true;


        }

        return super.onOptionsItemSelected(item);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.menu_prise_commande, menu);
        return true;
    }

    public void premierItem(Item item){
        data.items.add(item);
        //Creer le recyclerView
        recyclerCommande = findViewById(R.id.rv_CommandePriseCommande);
        LinearLayoutManager layoutManager = new LinearLayoutManager(PriseCommande.this);
        recyclerCommande.setLayoutManager(layoutManager);
        recyclerCommande.setHasFixedSize(true);
        adapterCommande = new ItemCommandeAdapter(data, PriseCommande.this,1);
        recyclerCommande.setAdapter(adapterCommande);

    }
    @Override
    public void onBackPressed() {
        new AlertDialog.Builder(this)
                .setIcon(android.R.drawable.ic_dialog_alert)
                .setTitle("Annuler la prise de commande")
                .setMessage("Êtes-vous certain ?")
                .setPositiveButton("Oui", new DialogInterface.OnClickListener()
                {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        finish();
                    }

                })
                .setNegativeButton("Non", null)
                .show();
    }


    @Override
    public boolean onSupportNavigateUp(){
        new AlertDialog.Builder(this)
                .setIcon(android.R.drawable.ic_dialog_alert)
                .setTitle("Annuler la prise de commande")
                .setMessage("Êtes-vous certain ?")
                .setPositiveButton("Oui", new DialogInterface.OnClickListener()
                {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        finish();
                    }

                })
                .setNegativeButton("Non", null)
                .show();
        return true;
    }



    public void addItem(Item item){
        data.items.add(item);
        adapterCommande.notifyDataSetChanged();
    }

    public void removeItem(Item item){
        data.items.remove(item);
        adapterCommande.notifyDataSetChanged();
    }

    //API REQUEST

    public void loadTypes() {
        ItemClient client = ServiceGenerator.retrofit.create(ItemClient.class);
        Call<Types> list = client.getTypes(Authentification.getXauth());

        list.enqueue(new Callback<Types>(){
            @Override
            public void onResponse(Call<Types> call, Response<Types> response){
                if (response.isSuccessful())
                {
                    mTypes = response.body();


                    LinearLayoutManager layoutManager = new LinearLayoutManager(getApplicationContext());

                    recyclerType.setLayoutManager(layoutManager);
                    recyclerType.setHasFixedSize(true);

                    TypeCommandeAdapter adapter = new TypeCommandeAdapter(mTypes, PriseCommande.this);
                    recyclerType.setAdapter(adapter);
                }
                else {
                    switch (response.code()) {
                        case 404:
                            Toast.makeText(getApplicationContext(), "404", Toast.LENGTH_SHORT).show();
                            break;
                        case 401:
                            Toast.makeText(getApplicationContext(), "401", Toast.LENGTH_SHORT).show();
                            break;
                        default:
                            Toast.makeText(getApplicationContext(), "Error onResponse (Autre)", Toast.LENGTH_SHORT).show();
                            break;
                    }
                }
            }
            @Override
            public void onFailure(Call<Types> call, Throwable t) {
                t.fillInStackTrace();
                Log.d("ERREUR", "onFailure: "+t.getMessage());
                Toast.makeText(getApplicationContext(), t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    public void loadItems(String typeSelectionne) {
        ItemClient client = ServiceGenerator.retrofit.create(ItemClient.class);
        final Call<Items> list = client.getItems(Authentification.getXauth(), typeSelectionne);

        list.enqueue(new Callback<Items>() {
            @Override
            public void onResponse(Call<Items> call, Response<Items> response) {
                if(response.isSuccessful())
                {
                    mItems = response.body();

                    recyclerItems = findViewById(R.id.rv_ListeItemsPriseCommande);
                    LinearLayoutManager layoutManager = new LinearLayoutManager(getApplicationContext());
                    recyclerItems.setLayoutManager(layoutManager);
                    recyclerItems.setHasFixedSize(true);

                    TextView labelItems = findViewById(R.id.NomItemLabelCommander);
                    TextView labelCommandes = findViewById(R.id.CommandeItemLabelCommander);
                    if (mItems.items.size() > 0){
                        labelItems.setVisibility(View.VISIBLE);
                        labelCommandes.setVisibility(View.VISIBLE);}

                    ItemCommandeAdapter adapter = new ItemCommandeAdapter(mItems, PriseCommande.this,0);
                    recyclerItems.setAdapter(adapter);
                }
                else {
                    switch (response.code()) {
                        case 404:
                            Toast.makeText(getApplicationContext(), "404", Toast.LENGTH_SHORT).show();
                            break;
                        case 401:
                            Toast.makeText(getApplicationContext(), "401", Toast.LENGTH_SHORT).show();
                            break;
                        default:
                            Toast.makeText(getApplicationContext(), "Error onResponse (Autre)", Toast.LENGTH_SHORT).show();
                            break;
                    }
                }
            }

            @Override
            public void onFailure(Call<Items> call, Throwable t) {
                t.fillInStackTrace();
                Log.d("ERREUR", "onFailure: "+t.getMessage());
                Toast.makeText(getApplicationContext(), t.getMessage(), Toast.LENGTH_SHORT).show();

            }
        });
    }

    public void envoieCommande(CommandeBody commandeBody){
        CommandeClient client = ServiceGenerator.retrofit.create(CommandeClient.class);
        Call<Void> commande = client.PriseCommande(Authentification.getXauth(),idTable,commandeBody);
        commande.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if(response.isSuccessful())
                {
                    finish();

                }
                else {
                    switch (response.code()) {
                        case 404:
                            Toast.makeText(getApplicationContext(), "404", Toast.LENGTH_SHORT).show();
                            break;
                        case 401:
                            Toast.makeText(getApplicationContext(), "401", Toast.LENGTH_SHORT).show();
                            break;
                        default:
                            Toast.makeText(getApplicationContext(), "Error onResponse (Autre)", Toast.LENGTH_SHORT).show();
                            break;
                    }
                }
            }
            @Override
            public void onFailure(Call<Void> call, Throwable t) {
            t.fillInStackTrace();
            Log.d("ERREUR", "onFailure: "+t.getMessage());
            Toast.makeText(getApplicationContext(), t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });



    }




}
