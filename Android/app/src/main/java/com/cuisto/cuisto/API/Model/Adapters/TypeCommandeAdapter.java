package com.cuisto.cuisto.API.Model.Adapters;

import android.content.Context;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.cuisto.cuisto.API.Model.Types;
import com.cuisto.cuisto.R;

import com.cuisto.cuisto.UI.ItemListFragment;
import com.cuisto.cuisto.UI.PriseCommande;

public class TypeCommandeAdapter extends RecyclerView.Adapter<TypeCommandeAdapter.ViewHolder>{
    private Types types;
    private Context mContext;
    private ItemListFragment fragment;

    public TypeCommandeAdapter(Types types, Context context) {

        this.types = types;
        this.mContext = context;

    }

    @Override
    public TypeCommandeAdapter.ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {

        View view = LayoutInflater.from(mContext).inflate(R.layout.list_type,parent,false);
        final TypeCommandeAdapter.ViewHolder viewHolder = new TypeCommandeAdapter.ViewHolder(view);



        return viewHolder;
    }

    @Override
    public void onBindViewHolder(TypeCommandeAdapter.ViewHolder holder, final int position) {
        holder.bind(types.types.get(position));

        holder.rv_type.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                ((PriseCommande)mContext).loadItems(types.types.get(position));
            }
        });
    }



    @Override
    public int getItemCount() {
        return types.types.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder{
        public TextView type;
        RelativeLayout rv_type;

        public ViewHolder(View typeView) {
            super(typeView);
            this.type = (TextView) typeView.findViewById(R.id.tv_type);
            this.rv_type = (RelativeLayout) typeView.findViewById(R.id.rl_Type);
        }

        public void bind(final String string){
            this.type.setText(string);

        }
    }
}
