package com.cuisto.cuisto.API.Model.Adapters;

import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.support.annotation.NonNull;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AlertDialog;
import android.support.v7.widget.RecyclerView;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.PopupMenu;
import android.widget.TextView;

import com.cuisto.cuisto.API.Model.Client;
import com.cuisto.cuisto.API.Model.Clients;
import com.cuisto.cuisto.R;
import com.cuisto.cuisto.UI.PriseCommande;

// TODO: Afficher c'est la commande de qui
public class PriseCommandeAdapter extends RecyclerView.Adapter<PriseCommandeAdapter.MyViewHolder> {
    private Clients listClient;
    private Context mContext;
    private int idTable;

    public PriseCommandeAdapter(Clients clients, Context context, int idTable) {
        this.listClient = clients;
        this.mContext = context;
        this.idTable = idTable;
    }

    @NonNull
    @Override
    public MyViewHolder onCreateViewHolder(@NonNull ViewGroup viewGroup, int i) {
        View view = LayoutInflater.from(viewGroup.getContext()).inflate(R.layout.list_parent, viewGroup, false);
        return new MyViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull final MyViewHolder viewHolder, final int i) {
        Client client = listClient.clientList.get(i);
        viewHolder.textView_parentName.setText("Client #" + (i + 1));

        viewHolder.btn_ajouter.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                Intent intent = new Intent(mContext, PriseCommande.class);
                intent.putExtra("NumClient", i + 1);
                intent.putExtra("idTable", idTable);
                mContext.startActivity(intent);

            }
        });

        int noOfCHildTextViews = viewHolder.linearLayout_childItems.getChildCount();
        int noOfChild = client.getCommandes().commandes.size();
        if(noOfChild > 0){
            viewHolder.icon_expand.setVisibility(View.VISIBLE);
        }
        if (noOfChild < noOfCHildTextViews) {
            for (int index = noOfChild; index < noOfCHildTextViews; index++) {
                TextView currentTextView = (TextView) viewHolder.linearLayout_childItems.getChildAt(index);
                currentTextView.setVisibility(View.GONE);
            }
        }
        for (int textViewIndex = 0; textViewIndex < noOfChild; textViewIndex++) {
            final int a = textViewIndex;
            TextView currentTextView = (TextView) viewHolder.linearLayout_childItems.getChildAt(textViewIndex);
            // TODO: Décider quoi mettre comme information ici
            currentTextView.setText("Commande id:" + listClient.clientList.get(i).getCommandes().commandes.get(textViewIndex).getId());
            currentTextView.setOnLongClickListener(new View.OnLongClickListener() {
                @Override
                public boolean onLongClick(View v) {
                    PopupMenu popup = new PopupMenu(mContext, v);
                    popup.getMenuInflater().inflate(R.menu.menu_en_cours, popup.getMenu());
                    popup.show();
                    popup.setOnMenuItemClickListener(new PopupMenu.OnMenuItemClickListener() {
                        @Override
                        public boolean onMenuItemClick(MenuItem item) {

                            switch (item.getItemId()) {
                                case R.id.menu_enCours_info:
                                    String commande = "";
                                    for(int y = 0; y < listClient.clientList.get(i).getCommandes().commandes.get(a).getItems().size();y++){
                                        commande += listClient.clientList.get(i).getCommandes().commandes.get(a).getItems().get(y).getNom()+"\n";
                                    }
                                    commande += " \n";
                                    AlertDialog.Builder builder = new AlertDialog.Builder(mContext);
                                    builder.setMessage(commande)
                                            .setCancelable(false)
                                            .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                                                public void onClick(DialogInterface dialog, int id) {
                                                    //do things
                                                }
                                            });
                                    AlertDialog alert = builder.create();
                                    alert.show();

                                    break;


                                default:
                                    break;
                            }

                            return true;
                        }
                    });
                    return false;
                }
            });


            // Le style en fonction du state de la commande
            if (listClient.clientList.get(i).getCommandes().commandes.get(textViewIndex).getStatut().equals("En cours")) {

                currentTextView.setBackground(mContext.getDrawable(R.drawable.drawable_commande_not_ready));
                currentTextView.setElevation(8);
                currentTextView.setPadding(10,10,10,10);

            } else {

                currentTextView.setBackground(mContext.getDrawable(R.drawable.drawable_commande_ready));
                currentTextView.setElevation(8);
                currentTextView.setPadding(10,10,10,10);
            }
        }
    }

    @Override
    public int getItemCount() {
        return listClient.clientList.size();
    }

    class MyViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {
        private Context context;
        TextView textView_parentName;
        private Button btn_ajouter;
        private LinearLayout linearLayout_childItems;
        ImageView icon_expand;

        MyViewHolder(final View itemView) {
            super(itemView);
            icon_expand = itemView.findViewById(R.id.icon_expand);
            btn_ajouter = itemView.findViewById(R.id.Btn_AjouterCmd);
            context = itemView.getContext();
            textView_parentName = itemView.findViewById(R.id.tv_parentName);
            linearLayout_childItems = itemView.findViewById(R.id.ll_child_items);
            linearLayout_childItems.setVisibility(View.GONE);
            int intMaxNoOfChild = 0;
            for (int index = 0; index < listClient.clientList.size(); index++) {
                int intMaxSizeTemp = listClient.clientList.get(index).getCommandes().commandes.size();
                if (intMaxSizeTemp > intMaxNoOfChild) intMaxNoOfChild = intMaxSizeTemp;
            }
            for (int indexView = 0; indexView < intMaxNoOfChild; indexView++) {
                TextView textView = new TextView(context);
                textView.setId(indexView);
                textView.setPadding(0, 20, 0, 20);
                textView.setGravity(Gravity.CENTER);
                textView.setBackground(ContextCompat.getDrawable(context, R.drawable.background_sub_module_text));
                LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
                layoutParams.setMargins(25,25,25,25);
                textView.setOnClickListener(this);

                linearLayout_childItems.addView(textView, layoutParams);
            }

            textView_parentName.setOnClickListener(this);
        }

        @Override
        public void onClick(final View view) {
            if (view.getId() == R.id.tv_parentName) {
                if (linearLayout_childItems.getVisibility() == View.VISIBLE) {
                    linearLayout_childItems.setVisibility(View.GONE);
                } else {
                    linearLayout_childItems.setVisibility(View.VISIBLE);
                }
            }
        }
    }
}
