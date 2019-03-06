package com.cuisto.cuisto.API.Model.Adapters;

import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v4.app.FragmentTransaction;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.cuisto.cuisto.API.Model.Table;
import com.cuisto.cuisto.API.Model.Tables;
import com.cuisto.cuisto.R;
import com.cuisto.cuisto.UI.Commande.MainFragment.CommandeListFragment;
import com.cuisto.cuisto.UI.MainActivity;

public class TableAdapter extends RecyclerView.Adapter<TableAdapter.ListeTableViewHolder> {

    private static final String TAG = TableAdapter.class.getSimpleName();

    private Tables listeTable;
    private Context mContext;
    private int Row_index = -1;
    CommandeListFragment fragment;

    public TableAdapter(Tables listeTable, Context mContext) {
        this.listeTable = listeTable;
        this.mContext = mContext;
    }

    @NonNull
    @Override
    public ListeTableViewHolder onCreateViewHolder(@NonNull ViewGroup viewGroup, final int viewType) {

        final View view = LayoutInflater.from(mContext).inflate(R.layout.fragment_liste_table, viewGroup, false);
        final ListeTableViewHolder viewHolder = new ListeTableViewHolder(view);

        return viewHolder;
    }

    public void test(){
        MainActivity mainActivity = (MainActivity) mContext;
        mainActivity.removeFragmentDroite(fragment);
    }

    @NonNull
    @Override
    public void onBindViewHolder(@NonNull final ListeTableViewHolder listeTableViewHolder, final int i) {
        listeTableViewHolder.bind(listeTable.getTables().get(i));

        listeTableViewHolder.Rl_Table.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(listeTableViewHolder.getAdapterPosition() != -1){
                    Row_index = i;
                    Bundle args = new Bundle();
                    args.putInt("id", listeTable.getTables().get(listeTableViewHolder.getAdapterPosition()).getId());
                    args.putString("nom", listeTable.getTables().get(listeTableViewHolder.getAdapterPosition()).getNom());
                    args.putInt("maxPlace", Integer.valueOf(listeTable.getTables().get(listeTableViewHolder.getAdapterPosition()).getMaxPlace()));
                    fragment = new CommandeListFragment();
                    fragment.setArguments(args);


                    MainActivity mainActivity = (MainActivity) mContext;
                    // Changer le fragment de droite avec la liste des clients en fonctions de la table choisis
                    mainActivity.setFragmentDroite(fragment);
                    notifyDataSetChanged();
                }
                else {
                    Toast.makeText(mContext, "allo un test encore", Toast.LENGTH_SHORT).show();
                }
            }
        });

        // Couleur en fonction si choisi
        if (Row_index == i) {
            listeTableViewHolder.Rl_Table.setBackground(mContext.getResources().getDrawable(R.drawable.liste_table_border_selectionne));
        } else {
            listeTableViewHolder.Rl_Table.setBackground(mContext.getResources().getDrawable(R.drawable.liste_table_border));
        }

    }


    @Override
    public int getItemCount() {
        return listeTable.getTables().size();
    }


    class ListeTableViewHolder extends RecyclerView.ViewHolder {

        TextView Tv_NomTable;
        TextView Tv_MaxPlace;
        RelativeLayout Rl_Table;

        public ListeTableViewHolder(View itemView) {
            super(itemView);
            Tv_NomTable = (TextView) itemView.findViewById(R.id.tv_nomTable);
            Tv_MaxPlace = (TextView) itemView.findViewById(R.id.tv_maxPlace);
            Rl_Table = (RelativeLayout) itemView.findViewById(R.id.Rl_TableEach);
        }

        public void bind(Table tableTable) {
            Log.d(TAG, tableTable.getNom());
            if(tableTable.getNom().length() > 15){
                String test = tableTable.getNom().substring(0,12);
                test = test+"...";
                this.Tv_NomTable.setText(test);
            }
            else {
                this.Tv_NomTable.setText(tableTable.getNom());

            }
            this.Tv_MaxPlace.setText(tableTable.getMaxPlace());
        }
    }
}
