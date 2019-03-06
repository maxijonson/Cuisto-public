package com.cuisto.cuisto.UI;

import android.support.annotation.NonNull;
import android.support.v4.app.Fragment;
import android.os.Bundle;
import android.support.v7.widget.DividerItemDecoration;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;


import com.cuisto.cuisto.API.Model.Adapters.ItemAdapter;
import com.cuisto.cuisto.API.Model.Adapters.TypeAdapter;
import com.cuisto.cuisto.API.Model.Items;
import com.cuisto.cuisto.API.Model.Item;
import com.cuisto.cuisto.API.Model.Types;
import com.cuisto.cuisto.API.Service.ItemClient;
import com.cuisto.cuisto.API.Service.ServiceGenerator;
import com.cuisto.cuisto.Authentification;
import com.cuisto.cuisto.R;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ItemListFragment extends Fragment{

    RecyclerView recyclerType;
    RecyclerView recyclerItems;

    public RelativeLayout relativeLayout;
    TextView NomItem;
    TextView DescriptionItem;
    TextView PrixItem;
    TextView TypeItem;
    TextView NomMenu;
    TextView TypeMenu;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ((MainActivity) getActivity()).setActionBarTitle("Liste des items");
        loadTypes();
    }



    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState){
        //The whole fragment
        View view = inflater.inflate(R.layout.fragment_liste_item,container,false);

        relativeLayout = view.findViewById(R.id.rl_Description);
        NomItem = view.findViewById(R.id.tv_NomItem);
        DescriptionItem = view.findViewById(R.id.tv_DescriptionItem);
        PrixItem = view.findViewById(R.id.tv_PrixItem);
        TypeItem = view.findViewById(R.id.tv_TypeItem);
        NomMenu = view.findViewById(R.id.tv_NomMenu);
        TypeMenu = view.findViewById(R.id.tv_TypeMenu);

        return view;

    }

    public void loadTypes() {
        ItemClient client = ServiceGenerator.retrofit.create(ItemClient.class);
        Call<Types> list = client.getTypes(Authentification.getXauth());

        list.enqueue(new Callback<Types>(){
           @Override
           public void onResponse(Call<Types> call, Response<Types> response){
               if (response.isSuccessful())
               {
                   Types mTypes = response.body();
                   String[] data = new String[mTypes.types.size()];
                   for(int i = 0;i < mTypes.types.size();i++) {
                    data[i] =  mTypes.types.get(i);
                   }
                   if(getActivity() != null){
                        //Initializing the recycler
                        recyclerType = getActivity().findViewById(R.id.rv_ListeTypes);
                        if(recyclerType != null){
                            //Setting the style
                            recyclerType.addItemDecoration(new DividerItemDecoration(getContext(),DividerItemDecoration.HORIZONTAL));
                            recyclerType.addItemDecoration(new DividerItemDecoration(getContext(),DividerItemDecoration.VERTICAL));
                            LinearLayoutManager layoutManager = new LinearLayoutManager(getActivity());
                            recyclerType.setLayoutManager(layoutManager);
                            recyclerType.setHasFixedSize(true);
                            //Getting the adapter ready
                            TypeAdapter adapter = new TypeAdapter(data, getContext(), ItemListFragment.this);
                            recyclerType.setAdapter(adapter);
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
                           Toast.makeText(getActivity(), "Error onResponse (Autre)", Toast.LENGTH_SHORT).show();
                           break;
                   }
               }
           }
            @Override
            public void onFailure(Call<Types> call, Throwable t) {
                t.fillInStackTrace();
                Log.d("ERREUR", "onFailure: "+t.getMessage());
                Toast.makeText(getActivity(), t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    public void loadItems(String typeSelectionne) {
            ItemClient client = ServiceGenerator.retrofit.create(ItemClient.class);
            Call<Items> list = client.getItems(Authentification.getXauth(), typeSelectionne);

             list.enqueue(new Callback<Items>() {
                @Override
                public void onResponse(Call<Items> call, Response<Items> response) {
                    if(response.isSuccessful())
                    {
                        Items mItems = response.body();
                        Item[] data = new Item[mItems.items.size()];
                        for(int i = 0; i < mItems.items.size(); i++) {
                            Item temp = mItems.items.get(i);
                            data[i] = new Item(temp.getId(),temp.getNom(),temp.getPrix(),temp.getDescription(),temp.getTypeItem(), temp.getMenu());
                       }

                       //Initializing the recycler
                        recyclerItems = getActivity().findViewById(R.id.rv_ListeItems);
                        //Setting the layout
                        //Borders
                            //Remove old borders
                            RecyclerView.ItemDecoration itemDecoration;
                            while (recyclerItems.getItemDecorationCount() > 0
                                    &&(itemDecoration = recyclerItems.getItemDecorationAt(0)) != null) {
                                recyclerItems.removeItemDecoration(itemDecoration);
                            }
                            //Add borders
                            recyclerItems.addItemDecoration(new DividerItemDecoration(getContext(),DividerItemDecoration.HORIZONTAL));
                            recyclerItems.addItemDecoration(new DividerItemDecoration(getContext(),DividerItemDecoration.VERTICAL));
                            //Others
                        LinearLayoutManager layoutManager = new LinearLayoutManager(getActivity());
                        recyclerItems.setLayoutManager(layoutManager);
                        recyclerItems.setHasFixedSize(true);
                        TextView label = getActivity().findViewById(R.id.NomItemLabel);
                        if (data.length > 0)
                           label.setVisibility(View.VISIBLE);
                        //Setting the adapter
                        ItemAdapter adapter = new ItemAdapter(data, getContext(), ItemListFragment.this);
                        recyclerItems.setAdapter(adapter);
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
                                Toast.makeText(getActivity(), "Error onResponse (Autre)", Toast.LENGTH_SHORT).show();
                                break;
                        }
                    }
                }

                @Override
                public void onFailure(Call<Items> call, Throwable t) {
                    t.fillInStackTrace();
                    Log.d("ERREUR", "onFailure: "+t.getMessage());
                    Toast.makeText(getActivity(), t.getMessage(), Toast.LENGTH_SHORT).show();

                }
            });
    }

    public void loadDescription(int itemSelectonne) {
        ItemClient client = ServiceGenerator.retrofit.create(ItemClient.class);
        Call<Item> list = client.getDescriptionItem(Authentification.getXauth(), itemSelectonne);

        list.enqueue(new Callback<Item>() {
            @Override
            public void onResponse(Call<Item> call, Response<Item> response) {
                if(response.isSuccessful())
                {
                    Item mItemDesc = response.body();
                    Item data = mItemDesc;

                    relativeLayout.setVisibility(View.VISIBLE);

                    NomItem.setText(data.getNom());
                    DescriptionItem.setText(data.getDescription());
                    PrixItem.setText(data.getPrix() + "$");
                    TypeItem.setText(data.getTypeItem());
                    NomMenu.setText(data.getMenu().getNom());
                    if (data.getMenu().getType() != null)
                    TypeMenu.setText(data.getMenu().getType());
                    else TypeMenu.setText("Aucun Type");

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
                            Toast.makeText(getActivity(), "Error onResponse (Autre)", Toast.LENGTH_SHORT).show();
                            break;
                    }
                }
            }

            @Override
            public void onFailure(Call<Item> call, Throwable t) {
                t.fillInStackTrace();
                Log.d("ERREUR", "onFailure: "+t.getMessage());
                Toast.makeText(getActivity(), t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
