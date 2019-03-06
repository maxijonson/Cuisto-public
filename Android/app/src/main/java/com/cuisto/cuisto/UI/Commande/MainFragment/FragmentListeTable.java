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
import android.widget.RelativeLayout;
import android.widget.Toast;

import com.cuisto.cuisto.API.Model.Adapters.TableAdapter;
import com.cuisto.cuisto.API.Model.Tables;
import com.cuisto.cuisto.API.Service.TableClient;
import com.cuisto.cuisto.API.Service.ServiceGenerator;
import com.cuisto.cuisto.Authentification;
import com.cuisto.cuisto.R;
import com.cuisto.cuisto.UI.MainActivity;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class FragmentListeTable extends Fragment {
    //LISTE DES TABLES A GAUCHE DANS PRISE DE COMMANDE
    TableAdapter mAdapter;
    RecyclerView mTableList;
    Tables listeTable;
    Context mContext;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mContext = getContext();
        ((MainActivity) getActivity()).setActionBarTitle("Liste des tables");
        loadListTable();

    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        RelativeLayout LL = (RelativeLayout) inflater.inflate(R.layout.fragment_prise_de_commande,container,false);

        return LL;
    }

    @Override
    public void onResume() {
        super.onResume();
        loadListTable();
        if(mAdapter != null)
        {
            mAdapter.test();
            mAdapter.notifyDataSetChanged();
        }

    }

    void loadListTable(){
        TableClient client = ServiceGenerator.retrofit.create(TableClient.class);
        Call<Tables> list = client.getListTable(Authentification.getXauth());

        list.enqueue(new Callback<Tables>() {
            @Override
            public void onResponse(Call<Tables> call, Response<Tables> response) {
                if(response.isSuccessful()){
                    listeTable = response.body();
                    if(getActivity() != null){

                        mTableList = (RecyclerView)getActivity().findViewById(R.id.rv_ListeCommande);

                        LinearLayoutManager layoutManager = new LinearLayoutManager(getActivity());
                        if(mTableList != null && listeTable.getTables() != null){

                            mTableList.setLayoutManager(layoutManager);
                            mTableList.setHasFixedSize(false);
                            mAdapter = new TableAdapter(listeTable, getContext());
                            mTableList.setAdapter(mAdapter);

                            //Bundle args = new Bundle();
                            //args.putInt("id", listeTable.getTables().get(0).getId());
                            //args.putString("nom", listeTable.getTables().get(0).getNom());
                            //args.putInt("maxPlace", Integer.valueOf(listeTable.getTables().get(0).getMaxPlace()));
                            //CommandeListFragment fragment = new CommandeListFragment();
                            //fragment.setArguments(args);

                            //MainActivity mainActivity = (MainActivity) mContext;
                            // Changer le fragment de droite avec la liste des clients en fonctions de la table choisis
                            //mainActivity.setFragmentDroite(fragment);
                        }
                    }

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
            public void onFailure(Call<Tables> call, Throwable t) {

            }
        });
    }
}
