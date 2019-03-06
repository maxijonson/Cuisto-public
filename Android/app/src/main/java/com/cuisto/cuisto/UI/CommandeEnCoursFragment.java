package com.cuisto.cuisto.UI;

import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v4.app.Fragment;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import com.cuisto.cuisto.API.Model.Adapters.CommandesEnCoursAdapter;
import com.cuisto.cuisto.API.Model.Commande;
import com.cuisto.cuisto.API.Model.Commandes;
import com.cuisto.cuisto.API.Service.CommandeClient;
import com.cuisto.cuisto.API.Service.ServiceGenerator;
import com.cuisto.cuisto.Authentification;
import com.cuisto.cuisto.R;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CommandeEnCoursFragment extends Fragment {

    RecyclerView recyclerEnCours;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ((MainActivity) getActivity()).setActionBarTitle("Commandes en Cours");
        loadEnCours();
    }


    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_commande_en_cours, container, false);

        return view;
    }

    private void loadEnCours() {
        CommandeClient client = ServiceGenerator.retrofit.create(CommandeClient.class);
        Call<Commandes> list = client.ListeCommandes(Authentification.getXauth(), "En Cours");

        list.enqueue(new Callback<Commandes>() {
            @Override
            public void onResponse(Call<Commandes> call, Response<Commandes> response) {
                if (response.isSuccessful()) {
                    Commandes mCommandes = response.body();
                    Commande[] data = new Commande[mCommandes.commandes.size()];
                    for (int i = 0; i < mCommandes.commandes.size(); i++) {
                        Commande temp = mCommandes.commandes.get(i);
                        data[i] = new Commande(temp.getId(), temp.getStatut(), temp.getItems(), temp.getClient(), temp.getEmploye(), temp.getTable());
                    }
                    if(getActivity() != null) {
                        recyclerEnCours = getActivity().findViewById(R.id.rv_CommandesEnCours);
                    }

                        LinearLayoutManager layoutManager = new LinearLayoutManager(getContext(), LinearLayoutManager.HORIZONTAL, false);
                        if (recyclerEnCours != null) {


                            recyclerEnCours.setLayoutManager(layoutManager);
                            recyclerEnCours.setHasFixedSize(true);

                            CommandesEnCoursAdapter adapter = new CommandesEnCoursAdapter(data, getContext(), CommandeEnCoursFragment.this);
                            recyclerEnCours.setAdapter(adapter);

                    }

                } else {
                    switch (response.code()) {
                        case 404:
                            Toast.makeText(getActivity(), "404", Toast.LENGTH_SHORT).show();
                            break;
                        case 401:
                            Toast.makeText(getActivity(), "401", Toast.LENGTH_SHORT).show();
                            break;
                        default:
                            Toast.makeText(getActivity(), String.valueOf(response.code()), Toast.LENGTH_SHORT).show();
                            Toast.makeText(getActivity(), "Error onResponse (Autre)", Toast.LENGTH_SHORT).show();
                            break;
                    }
                }
            }

            @Override
            public void onFailure(Call<Commandes> call, Throwable t) {
                t.fillInStackTrace();
                Log.d("ERREUR", "onFailure: " + t.getMessage());
                Toast.makeText(getActivity(), t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    public void readyCommande(int id) {
        CommandeClient client = ServiceGenerator.retrofit.create(CommandeClient.class);
        Call<Commandes> list = client.PatchCommande(Authentification.getXauth(), id, new Commande("Prête"));

        list.enqueue(new Callback<Commandes>() {
            @Override
            public void onResponse(Call<Commandes> call, Response<Commandes> response) {
                if (response.isSuccessful()) {
                    loadEnCours();
                } else {
                    switch (response.code()) {
                        case 404:
                            Toast.makeText(getActivity(), "404", Toast.LENGTH_SHORT).show();
                            break;
                        case 401:
                            Toast.makeText(getActivity(), "401", Toast.LENGTH_SHORT).show();
                            break;
                        default:
                            Toast.makeText(getActivity(), "Error onResponse (Autre)", Toast.LENGTH_SHORT).show();
                            break;
                    }
                }
            }

            @Override
            public void onFailure(Call<Commandes> call, Throwable t) {
                t.fillInStackTrace();
                Log.d("ERREUR", "onFailure: " + t.getMessage());
                Toast.makeText(getActivity(), t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
