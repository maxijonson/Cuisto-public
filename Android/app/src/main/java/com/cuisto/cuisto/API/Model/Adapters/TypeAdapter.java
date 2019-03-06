package com.cuisto.cuisto.API.Model.Adapters;

import android.content.Context;
import android.graphics.Color;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.cuisto.cuisto.R;

import com.cuisto.cuisto.UI.ItemListFragment;

public class TypeAdapter extends RecyclerView.Adapter<TypeAdapter.ViewHolder>{
    private String[] data;
    private Context context;
    private ItemListFragment fragment;
    private int SelectedIndex = -1;

    public TypeAdapter(String[] data, Context context, ItemListFragment fragment) {

        this.data = data;
        this.context = context;
        this.fragment = fragment;
    }

    @Override
    public TypeAdapter.ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        LayoutInflater layoutInflater = LayoutInflater.from(parent.getContext());
        final View listType= layoutInflater.inflate(R.layout.list_type,parent,false);
        final TypeAdapter.ViewHolder viewHolder = new TypeAdapter.ViewHolder(listType);
        return viewHolder;
    }

    @Override
    public void onBindViewHolder(final ViewHolder holder, final int position) {
        holder.type.setText(data[position]);
        holder.rl_Type.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                SelectedIndex = position;
                String typeSelectionne = data[holder.getAdapterPosition()];
                fragment.loadItems(typeSelectionne);
                fragment.relativeLayout.setVisibility(View.GONE);
                notifyDataSetChanged();
            }
        });
        if (SelectedIndex == position) {
            holder.rl_Type.setBackgroundColor(Color.parseColor("#E3E3E3"));
        }
        else {
            holder.rl_Type.setBackgroundColor(Color.WHITE);
        }
    }

    @Override
    public int getItemCount() {
        return data.length;
    }

    public static class ViewHolder extends RecyclerView.ViewHolder{
        public TextView type;
        public RelativeLayout rl_Type;
        public ViewHolder(View typeView) {
            super(typeView);
            this.type = (TextView) typeView.findViewById(R.id.tv_type);
            this.rl_Type = typeView.findViewById(R.id.rl_Type);
        }
    }
}
