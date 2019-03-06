package com.cuisto.cuisto.UI.Commande.MainFragment;

import android.content.Context;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v4.app.Fragment;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.Toast;

import com.cuisto.cuisto.API.Model.Client;
import com.cuisto.cuisto.API.Model.Clients;
import com.cuisto.cuisto.API.Model.Commande;

import com.cuisto.cuisto.API.Model.Commandes;
import com.cuisto.cuisto.API.Model.Adapters.PriseCommandeAdapter;

import com.cuisto.cuisto.API.Model.Table;
import com.cuisto.cuisto.API.Service.CommandeClient;
import com.cuisto.cuisto.API.Service.ServiceGenerator;
import com.cuisto.cuisto.Authentification;
import com.cuisto.cuisto.R;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;


public class CommandeListFragment extends Fragment{

    //LE FRAGMENT A DROITE QUI EST LA LISTE DES TABLES AVEC LE RV DE LA LISTE DES COMMANDES
    private PriseCommandeAdapter mAdapter;

    private RecyclerView mCommandeList;

    private Commandes commandeList = new Commandes(new ArrayList<Commande>());

    private Clients listClients;
    // Info de la table Creer
    int id;
    String nom;
    int maxPlace;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        id = getArguments().getInt("id");
        nom = getArguments().getString("nom");
        maxPlace = getArguments().getInt("maxPlace");


    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        FrameLayout FL = (FrameLayout)inflater.inflate(R.layout.fragment_commande_list,container,false);

        //Creer client dynamiquement
        List<Client> clientslist = new ArrayList<>();
        for(int i = 0; i < maxPlace; i++){
            clientslist.add(new Client(i,new Commandes(new ArrayList<Commande>()), new Table(id,String.valueOf(maxPlace),nom)));
        }
        listClients = new Clients(clientslist);
        //Apres avoir creer les clients
        listerCommandeClient();

        //Adapter
        mCommandeList = FL.findViewById(R.id.rv_ListeCommandeAAA);

        return FL;
    }

    @Override
    public void onAttach(Context context){
        super.onAttach(context);

    }

    public void listerCommandeClient(){
        CommandeClient client = ServiceGenerator.retrofit.create(CommandeClient.class);
        Call<Commandes> list = client.ListeCommandesTable(Authentification.getXauth(),id);

        list.enqueue(new Callback<Commandes>() {
            @Override
            public void onResponse(Call<Commandes> call, Response<Commandes> response) {
                if(response.isSuccessful()){

                    commandeList = response.body();
                    trierCommande();

                    LinearLayoutManager layoutManager = new LinearLayoutManager(getActivity());

                    mCommandeList.setLayoutManager(layoutManager);
                    mCommandeList.setHasFixedSize(false);
                    mAdapter = new PriseCommandeAdapter(listClients, getContext(),id);
                    mCommandeList.setAdapter(mAdapter);

                }
                else {
                    switch (response.code()) {
                        case 404:
                            Toast.makeText(getActivity(), "404", Toast.LENGTH_SHORT).show();
                            break;
                        case 401:
                            Toast.makeText(getActivity(), "401", Toast.LENGTH_SHORT).show();
                            break;
                        default:
                            Toast.makeText(getActivity(), String.valueOf(response.code()), Toast.LENGTH_SHORT).show();
                            break;
                    }
                }
            }

            @Override
            public void onFailure(Call<Commandes> call, Throwable t) {
                Toast.makeText(getActivity(), t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });

    }
    //Pourait etre éviter en faisant une requete pour chaque client d'une table
    public void trierCommande(){
        for(int i = 0; i < commandeList.commandes.size(); i++){
            if(commandeList.commandes.get(i).getClient() -1 != -1 && commandeList.commandes.get(i).getClient() -1 < maxPlace ){
                //Prend le client donc la commande a son numéro de client et lui ajoute la commande
                listClients.getClientList().get(commandeList.commandes.get(i).getClient() -1).getCommandes().commandes.add(commandeList.commandes.get(i));
            }

        }
    }
}
